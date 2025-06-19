import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import ModelSelect from './ModelSelect';

const AiAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 100 });
    const [size, setSize] = useState({ width: 420, height: 484 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [prevChat, setPrevChat] = useState([]); // 👈 память всех сообщений
    const [selectedModel, setSelectedModel] = useState(() => {
        return (
            localStorage.getItem('ai_model') || 'deepseek-ai/DeepSeek-R1-0528'
        );
    });

    useEffect(() => {
        localStorage.setItem('ai_model', selectedModel);
    }, [selectedModel]);

    const assistantRef = useRef(null);
    const resizeRef = useRef(null);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);

    const MODEL_OPTIONS = [
        { label: 'DeepSeek-R1', value: 'deepseek-ai/DeepSeek-R1-0528' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'Mixtral', value: 'mistralai/mixtral-8x7b' },
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (dragging) {
                setPosition({
                    x: e.clientX - offset.x,
                    y: e.clientY - offset.y,
                });
            }
            if (resizing) {
                setSize((prevSize) => ({
                    width: Math.max(
                        260,
                        e.clientX -
                            resizeRef.current.getBoundingClientRect().left,
                    ),
                    height: Math.max(
                        200,
                        e.clientY -
                            resizeRef.current.getBoundingClientRect().top,
                    ),
                }));
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
            setResizing(false);
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, resizing, offset]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current.focus(), 0);
        }
    }, [isOpen]);

    const handleMouseDown = (e) => {
        setDragging(true);
        const rect = assistantRef.current.getBoundingClientRect();
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        document.body.style.userSelect = 'none';
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        const formattedMessages = updatedMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: formattedMessages,
                    prev_messages: prevChat,
                    model: selectedModel, // 💥 добавлено
                }),
            });

            const data = await res.json();
            const responseText = data.text || 'Что-то пошло не так...';
            const thinkText = data.think || null;
            console.log(thinkText);
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: responseText,
                    think: thinkText,
                    showThink: false,
                },
            ]);

            setPrevChat((prev) => [
                ...prev,
                { role: 'user', content: userMessage.text },
                { role: 'assistant', content: responseText },
            ]);
        } catch (err) {
            console.error('Ошибка запроса:', err);
            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: 'Ошибка подключения к серверу 😓' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div
                ref={assistantRef}
                className="fixed z-50 w-14 h-14 bg-white/10 backdrop-blur-lg rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.2)] border border-white/20 flex items-center justify-center cursor-pointer"
                onMouseDown={handleMouseDown}
                onClick={() => setIsOpen(true)}
                style={{ left: position.x, top: position.y }}
            >
                <i className="fas fa-robot text-xl text-white"></i>
            </div>

            {isOpen && (
                <div
                    ref={resizeRef}
                    className="fixed bg-white/10 backdrop-blur-xl rounded-xl shadow-[0_4px_40px_rgba(255,255,255,0.1)] border border-white/20 flex flex-col z-50 text-white"
                    style={{
                        left: position.x + 60,
                        top: position.y,
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                    }}
                >
                    <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <h2 className="font-semibold">AI Ассистент</h2>
                        <div className="flex items-center gap-3">
                            <ModelSelect
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/60 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {messages.map((msg, idx) => {
                            const isAi = msg.sender === 'ai';
                            return (
                                <div
                                    key={idx}
                                    className={`text-sm px-4 py-2 rounded-xl max-w-[75%] w-fit break-words ${
                                        isAi
                                            ? 'bg-white/10 backdrop-blur-sm mr-auto text-left'
                                            : 'bg-blue-500/20 backdrop-blur-sm ml-auto text-right'
                                    }`}
                                >
                                    {isAi && msg.think && (
                                        <div className="mb-2">
                                            <button
                                                onClick={() => {
                                                    setMessages((prev) =>
                                                        prev.map((m, i) =>
                                                            i === idx
                                                                ? {
                                                                      ...m,
                                                                      showThink:
                                                                          !m.showThink,
                                                                  }
                                                                : m,
                                                        ),
                                                    );
                                                }}
                                                className="text-xs text-white/70 hover:underline mb-1"
                                            >
                                                {msg.showThink
                                                    ? 'Скрыть мысли 💭'
                                                    : 'Показать мысли 💭'}
                                            </button>
                                            {msg.showThink && (
                                                <div className="text-xs text-white/60 bg-white/5 p-2 rounded-md border border-white/10 whitespace-pre-wrap">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({
                                                                children,
                                                            }) => (
                                                                <p className="mb-1">
                                                                    {children}
                                                                </p>
                                                            ),
                                                            code: ({
                                                                children,
                                                            }) => (
                                                                <code className="bg-white/20 px-1 py-0.5 rounded text-white font-mono text-xs">
                                                                    {children}
                                                                </code>
                                                            ),
                                                            strong: ({
                                                                children,
                                                            }) => (
                                                                <strong className="font-semibold text-white">
                                                                    {children}
                                                                </strong>
                                                            ),
                                                        }}
                                                    >
                                                        {msg.think}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <ReactMarkdown
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            h1: ({ children }) => (
                                                <h1 className="text-2xl font-bold mb-2">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-xl font-bold mb-2">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-lg font-semibold mb-2">
                                                    {children}
                                                </h3>
                                            ),
                                            h4: ({ children }) => (
                                                <h4 className="text-base font-medium mb-2">
                                                    {children}
                                                </h4>
                                            ),
                                            h5: ({ children }) => (
                                                <h5 className="text-sm font-medium mb-2">
                                                    {children}
                                                </h5>
                                            ),
                                            h6: ({ children }) => (
                                                <h6 className="text-xs font-light mb-2">
                                                    {children}
                                                </h6>
                                            ),
                                            p: ({ children }) => (
                                                <p className="mb-2">
                                                    {children}
                                                </p>
                                            ),
                                            em: ({ children }) => (
                                                <em className="italic">
                                                    {children}
                                                </em>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-semibold">
                                                    {children}
                                                </strong>
                                            ),
                                            del: ({ children }) => (
                                                <del className="opacity-60">
                                                    {children}
                                                </del>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 pl-4 italic text-white/70 mb-2">
                                                    {children}
                                                </blockquote>
                                            ),
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 underline"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc ml-5 mb-2">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal ml-5 mb-2">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="mb-1">
                                                    {children}
                                                </li>
                                            ),
                                            table: ({ children }) => (
                                                <table className="table-auto border border-white/20 w-full mb-2">
                                                    {children}
                                                </table>
                                            ),
                                            thead: ({ children }) => (
                                                <thead className="bg-white/10">
                                                    {children}
                                                </thead>
                                            ),
                                            tbody: ({ children }) => (
                                                <tbody>{children}</tbody>
                                            ),
                                            tr: ({ children }) => (
                                                <tr className="border-t border-white/10">
                                                    {children}
                                                </tr>
                                            ),
                                            th: ({ children }) => (
                                                <th className="px-2 py-1 text-left font-semibold text-white">
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="px-2 py-1">
                                                    {children}
                                                </td>
                                            ),
                                            img: ({ src, alt }) => (
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className="my-2 rounded max-w-full"
                                                />
                                            ),
                                            code({
                                                node,
                                                inline,
                                                className,
                                                children,
                                                ...props
                                            }) {
                                                const match =
                                                    /language-(\w+)/.exec(
                                                        className || '',
                                                    );
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            background:
                                                                'transparent',
                                                            padding: '0.75rem',
                                                            borderRadius:
                                                                '0.5rem',
                                                            fontSize: '0.75rem',
                                                        }}
                                                        {...props}
                                                    >
                                                        {String(
                                                            children,
                                                        ).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-white/20 px-1 py-0.5 rounded text-white font-mono text-xs">
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-white/10 flex flex-col space-y-2 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 400) {
                                    setInput(value);
                                    if (textareaRef.current) {
                                        textareaRef.current.style.height =
                                            'auto';
                                        textareaRef.current.style.height =
                                            textareaRef.current.scrollHeight +
                                            'px';
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={isLoading}
                            className={`resize-none w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/50 outline-none transition-all duration-150 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            placeholder={
                                isLoading
                                    ? 'Ожидание ответа...'
                                    : 'Напиши что-нибудь...'
                            }
                            style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                minHeight: '40px',
                            }}
                        />
                        <div className="flex justify-between items-center">
                            {input.length > 349 && (
                                <div className="text-xs text-white/60">
                                    {input.length}/400
                                </div>
                            )}
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className={`w-fit px-4 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-md ${
                                    isLoading || !input.trim()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-white/20'
                                }`}
                            >
                                {isLoading ? '...' : 'Отправить'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize z-50"
                        onMouseDown={() => {
                            setResizing(true);
                            document.body.style.userSelect = 'none';
                        }}
                    >
                        <div className="w-full h-full border-r-2 border-b-2 border-white/40"></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiAssistant;
