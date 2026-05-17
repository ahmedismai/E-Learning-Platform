import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import chatbotService from "@/api/chatbot";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi! I'm LearnHub AI. I can help you understand concepts, debug code, or give study tips. (Note: I cannot solve exams or quizzes for you! 😊)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const renderMessageContent = (content) => {
    if (!content) return null;

    try {
      let parsedData =
        typeof content === "string" ? JSON.parse(content) : content;

      if (parsedData && typeof parsedData.recommendations === "string") {
        parsedData.recommendations = JSON.parse(parsedData.recommendations);
      }

      if (
        parsedData &&
        parsedData.recommendations &&
        Array.isArray(parsedData.recommendations)
      ) {
        return (
          <div className="space-y-3 min-w-[260px]">
            <p className="font-semibold text-primary text-xs flex items-center gap-1">
              ✨ Here are some recommended courses for you:
            </p>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {parsedData.recommendations.map((rec, i) => (
                <div
                  key={rec.courseId || i}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:border-primary/30 transition-colors shadow-sm flex flex-col gap-1"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight">
                      {rec.title}
                    </h4>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        rec.price === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {rec.price === 0 ? "Free" : `$${rec.price}`}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-normal italic">
                    "{rec.reason}"
                  </p>

                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>
                      Instructor:{" "}
                      <strong className="text-slate-500">
                        {rec.instructorName}
                      </strong>
                    </span>
                    <span className="bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded">
                      {rec.categoryName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (parsedData && parsedData.response) {
        return <p className="whitespace-pre-wrap">{parsedData.response}</p>;
      }
    } catch (e) {}

    return (
      <p className="whitespace-pre-wrap">
        {typeof content === "object" ? JSON.stringify(content) : content}
      </p>
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const data = await chatbotService.ask(currentInput);
      const botReply = data.recommendations
        ? data
        : data.response || data.answer || data;

      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, I'm having trouble thinking right now. Try again later!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:scale-110 transition-transform duration-300 animate-bounce"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[380px] h-[550px] shadow-2xl border-primary/20 flex flex-col animate-in slide-in-from-bottom-5 duration-300 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">LearnHub AI</CardTitle>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <Sparkles className="w-2 h-2" /> Powered by Gemini
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 text-white rounded-full h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col bg-slate-50/50 overflow-hidden">
            <ScrollArea className="flex-1 p-4 pr-6">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white border text-slate-700 rounded-tl-none"
                      }`}
                    >
                      {msg.role === "bot"
                        ? renderMessageContent(msg.content)
                        : msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t flex gap-2 items-center">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="rounded-xl bg-slate-50 border-none focus-visible:ring-primary h-11"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="rounded-xl h-11 w-11 p-0 shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;
