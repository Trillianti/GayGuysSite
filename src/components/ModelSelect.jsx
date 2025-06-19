import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react'; // 💡 заменили иконки

const MODEL_OPTIONS = [
    {
        name: 'LLaMA 4 Maverick 17B',
        value: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    },
    { name: 'DeepSeek R1 (0528)', value: 'deepseek-ai/DeepSeek-R1-0528' },
    { name: 'Qwen 3 235B A22B', value: 'Qwen/Qwen3-235B-A22B-FP8' },
    {
        name: 'LLaMA 3.3 70B Instruct',
        value: 'meta-llama/Llama-3.3-70B-Instruct',
    },
    { name: 'Gemma 3 27B IT', value: 'google/gemma-3-27b-it' },
    { name: 'Magistral Small 2506', value: 'mistralai/Magistral-Small-2506' },
    { name: 'Devstral Small 2505', value: 'mistralai/Devstral-Small-2505' },
    { name: 'QwQ 32B', value: 'Qwen/QwQ-32B' },
    {
        name: 'DeepSeek R1 Distill LLaMA 70B',
        value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    },
    { name: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1' },
    { name: 'DBRX Instruct', value: 'databricks/dbrx-instruct' },
    {
        name: 'DeepSeek R1 Distill Qwen 32B',
        value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    },
    {
        name: 'Nemotron 70B Instruct',
        value: 'neuralmagic/Llama-3.1-Nemotron-70B-Instruct-HF-FP8-dynamic',
    },
    { name: 'Phi-4', value: 'microsoft/phi-4' },
    { name: 'AceMath 7B', value: 'nvidia/AceMath-7B-Instruct' },
    {
        name: 'Mistral Large Instruct 2411',
        value: 'mistralai/Mistral-Large-Instruct-2411',
    },
    { name: 'Watt Tool 70B', value: 'watt-ai/watt-tool-70B' },
    {
        name: 'Dobby Mini LLaMA 3.1 8B',
        value: 'SentientAGI/Dobby-Mini-Unhinged-Llama-3.1-8B',
    },
    { name: 'Falcon 3 10B Instruct', value: 'tiiuae/Falcon3-10B-Instruct' },
    { name: 'Bespoke Stratos 32B', value: 'bespokelabs/Bespoke-Stratos-32B' },
    { name: 'Confucius o1 14B', value: 'netease-youdao/Confucius-o1-14B' },
    { name: 'AYA Expanse 32B', value: 'CohereForAI/aya-expanse-32b' },
    { name: 'Qwen Coder 32B', value: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
    { name: 'Sky T1 32B', value: 'NovaSky-AI/Sky-T1-32B-Preview' },
    { name: 'GLM 4 9B Chat', value: 'THUDM/glm-4-9b-chat' },
    {
        name: 'Ministral 8B Instruct 2410',
        value: 'mistralai/Ministral-8B-Instruct-2410',
    },
    { name: 'ReaderLM v2', value: 'jinaai/ReaderLM-v2' },
    { name: 'MiniCPM 3 4B', value: 'openbmb/MiniCPM3-4B' },
    { name: 'Qwen 2.5 1.5B Instruct', value: 'Qwen/Qwen2.5-1.5B-Instruct' },
    {
        name: 'Granite 3.1 8B Instruct',
        value: 'ibm-granite/granite-3.1-8b-instruct',
    },
    { name: '0x Lite', value: 'ozone-ai/0x-lite' },
    { name: 'Phi 3.5 Mini Instruct', value: 'microsoft/Phi-3.5-mini-instruct' },
];

export default function ModelSelect({ selectedModel, setSelectedModel }) {
    const selected =
        MODEL_OPTIONS.find((opt) => opt.value === selectedModel) ||
        MODEL_OPTIONS[0];

    return (
        <div className="w-fit text-white text-xs">
            <Listbox value={selectedModel} onChange={setSelectedModel}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white/10 backdrop-blur border border-white/20 py-1.5 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-1 focus:ring-white/50 transition-all hover:bg-white/20">
                        <span className="block truncate">{selected.name}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-white/70" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-fit max-w-[50vw] overflow-auto rounded-md bg-white/10 backdrop-blur border border-white/20 py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                            {MODEL_OPTIONS.map((option) => (
                                <Listbox.Option
                                    key={option.value}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 transition ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'text-white/80'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${
                                                    selected
                                                        ? 'font-semibold'
                                                        : ''
                                                }`}
                                            >
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/80">
                                                    <Check
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
