export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const systemPrompt = `আপনি একজন সহায়ক চিকিৎসা পরামর্শদাতা। আপনার কাজ হল:
- ব্যবহারকারীদের স্বাস্থ্য সংক্রান্ত প্রশ্নের উত্তর দেওয়া
- সাধারণ রোগের লক্ষণ এবং প্রতিকার সম্পর্কে তথ্য দেওয়া
- ওষুধের সাধারণ তথ্য প্রদান করা
- প্রয়োজনে ডাক্তারের পরামর্শ নিতে বলা

গুরুত্বপূর্ণ: আপনি একজন AI সহায়ক, ডাক্তার নন। গুরুতর সমস্যার জন্য সবসময় পেশাদার চিকিৎসকের পরামর্শ নিতে বলুন।

সব উত্তর বাংলায় দিন।`

  // Format messages for OpenAI API
  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    })),
  ]

  try {
    // Direct OpenAI API call without AI SDK
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error: "API call failed", details: error }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to process request", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
