import React, { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import axios from 'axios';
import Editor from "@monaco-editor/react";



//code editor component to be returned
const CodeEditor = () => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    //when execute is called, send a post request to the server
    const handleExecute = async () => {

        try {
            const response = await axios.post<{ stdout: string; stderr: string }>('/api/code/execute', {
            code,
            language,
            //adding newline to the end of stdin
            stdin: stdin + '\n',
            });
            if (!response) {
            throw new Error('No response from server');
            }
            //catch the output
            const { stdout } = response.data;
            setOutput(`Output:\n${stdout}`);
            setError('');

        } catch (error) {
            //if there is an error catch it

            const err = error as { response?: { data: { stderr: string } } };
            if (err.response && err.response.data && err.response.data.stderr) {
                setError(`${err.response.data.stderr || 'Error executing code'}`);
                setOutput('');
                return;
            }

            console.error('Error executing code:', error);
            setError('Error executing code');
            setOutput('');
        }
    };

    return (
        <div>
            <section id="code-editor" className="p-4 bg-[#383838] text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl">Code Editor</h2>
                    <select 
                        id="language-select" 
                        className="p-2 border border-[#585858] bg-[#9b9b9b] rounded-md"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="rust">Rust</option>
                        <option value="ruby">Ruby</option>
                        <option value="go">Go</option>
                        <option value="swift">Swift</option>
                        <option value="php">PHP</option>
                    </select>
                </div>
                

                <Editor
                    height="55vh"
                    defaultLanguage="javascript"
                    language={language}
                    defaultValue=""
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    className="w-full h-[50vh] p-1 mb-4 bg-[#585858] border border-gray-600 rounded-md"

                />


                
                <textarea
                    id="code-field" 
                    className="w-full p-2 mb-4 bg-[#585858] border border-gray-600 rounded" 
                    placeholder="Input field"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                />
                <button 
                    className="p-2 bg-[#9b9b9b] rounded"
                    onClick={handleExecute}
                >
                    Execute
                </button>
                <div id="code-output" className="w-full p-4 bg-[#585858] border border-gray-600 rounded mt-4">
                    {output || 'Output will be shown here...'}
                </div>
                <div id="code-output" className="w-full p-4 bg-[#585858] border border-gray-600 rounded mt-4">
                    {error|| 'Errors will be shown here...'}
                </div>
            </section>
        </div>
    );
};

export default CodeEditor;