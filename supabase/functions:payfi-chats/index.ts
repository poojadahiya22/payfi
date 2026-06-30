import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { threadId } = await req.json();
    if (!threadId) return new Response("threadId required", { status: 400, headers: corsHeaders });

    // Verify ownership and load messages
    const { data: thread } = await supabase.from("chat_threads").select("id").eq("id", threadId).eq("user_id", user.id).maybeSingle();
    if (!thread) return new Response("Not found", { status: 404, headers: corsHeaders });

    const { data: msgs } = await supabase.from("chat_messages").select("role,content").eq("thread_id", threadId).order("created_at");

    // Build user context from transactions/budgets/goals
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const { data: txns } = await supabase.from("transactions").select("date,type,category,amount,description").gte("date", monthStart.toISOString().slice(0, 10)).order("date", { ascending: false }).limit(200);
    const { data: budgets } = await supabase.from("budgets").select("category,monthly_limit");
    const { data: goals } = await supabase.from("goals").select("name,target_amount,saved_amount,deadline");

    const byCat: Record<string, number> = {};
    let income = 0, expense = 0;
    for (const t of txns ?? []) {
      const amt = Number(t.amount);
      if (t.type === "income") income += amt;
      else { expense += amt; byCat[t.category] = (byCat[t.category] ?? 0) + amt; }
    }
    const summary = `
This month's snapshot:
- Total income: ₹${income.toFixed(0)}
- Total expense: ₹${expense.toFixed(0)}
- Net savings: ₹${(income - expense).toFixed(0)}
- Spend by category: ${Object.entries(byCat).map(([k, v]) => `${k}: ₹${v.toFixed(0)}`).join(", ") || "none"}
- Budgets: ${(budgets ?? []).map((b: any) => `${b.category} ₹${b.monthly_limit}`).join(", ") || "none"}
- Goals: ${(goals ?? []).map((g: any) => `${g.name} (₹${g.saved_amount}/₹${g.target_amount})`).join(", ") || "none"}
- Recent transactions (latest first): ${(txns ?? []).slice(0, 15).map((t: any) => `${t.date} ${t.type} ${t.category} ₹${t.amount}${t.description ? ` (${t.description})` : ""}`).join("; ")}
`.trim();

    const system = `You are PayFi AI, a friendly personal finance assistant for an Indian student/young professional. Use ₹ for currency. Be concise (2-4 sentences typically), specific, and reference the user's actual data when relevant. Suggest concrete actions. Never invent numbers — if data is insufficient, say so.

USER FINANCIAL CONTEXT:
${summary}`;

    const apiKey = Deno.env.get("PayFi_API_KEY");
    if (!apiKey) return new Response("AI not configured", { status: 500, headers: corsHeaders });

    const aiResp = await fetch("https://ai.gateway.PayFi.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "PayFi-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...(msgs ?? []).map((m: any) => ({ role: m.role, content: m.content }))],
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      if (aiResp.status === 429) return new Response("Rate limit — try again shortly", { status: 429, headers: corsHeaders });
      if (aiResp.status === 402) return new Response("AI credits exhausted. Please add credits.", { status: 402, headers: corsHeaders });
      return new Response(`AI error: ${txt}`, { status: 500, headers: corsHeaders });
    }

    const j = await aiResp.json();
    const reply = j.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

    await supabase.from("chat_messages").insert({ thread_id: threadId, user_id: user.id, role: "assistant", content: reply });
    await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500, headers: corsHeaders });
  }
});
