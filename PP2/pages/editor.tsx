import React, { useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import Sidebar from '@/components/sidebar/Sidebar';
import SaveEditTemplate from "@/components/SaveTemplateButton";
import { useRouter } from 'next/router';


//code editor component to be returned
const CodeEditor = () => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [templateId, setTemplateId] = useState<number | null>(null); // Template ID for editing
    const [forkedId, setforkedId] = useState<number|null>(null)
    const router=useRouter()
    //populate code state if existing code
    const fetchTemplate = async () => {
   if(router.query.templateId){
    let url = `/api/CodeTemplate/${router.query.templateId}`;
     
         try{
              const res = await fetch(url,
         
         {
             method: 'GET',
             cache: 'no-store', 
           }
      
        
     );
     console.log(res)
         
     
          const data = await res.json();
          console.log(data)
          //console.log(data.pagedTemplates.length)
          if (res.ok){
             //if(data.paged_templates && data.paged_templates.length>0){
            
             setCode(data.code)
             console.log(data)
             console.log(data.code)
             const id = parseInt(typeof router.query.templateId === 'string' ? router.query.templateId : '')
             setTemplateId(id)
            
        
         }else{
          
             console.error(data.message)
         }
     
          
          
            
         //console.log(templates)
         }catch(err:any){
             console.error(err)
         }
   }else if (router.query.forkedId){
    let url = `/api/CodeTemplate/${router.query.forkedId}`;
     
         try{
              const res = await fetch(url,
         
         {
             method: 'GET',
             cache: 'no-store', 
           }
      
        
     );
     console.log(res)
         
     
          const data = await res.json();
          console.log(data)
          //console.log(data.pagedTemplates.length)
          if (res.ok){
             //if(data.paged_templates && data.paged_templates.length>0){
            
             setCode(data.code)
             console.log(data)
             console.log(data.code)
             const id = parseInt(typeof router.query.forkedId === 'string' ? router.query.forkedId : '')
             setforkedId(id)
            
        
         }else{
          
             console.error(data.message)
         }
     
          
          
            
         //console.log(templates)
         }catch(err:any){
             console.error(err)
         }
   }
        
       
         
        
       };

       useEffect(()=>{
        if(router.isReady){
            fetchTemplate()
        }
       },[router.isReady,router.query.templateId,router.query, router.query.forkedId])

       // Callback to update templateId when a new template is saved
  const handleTemplateSaved = (newTemplateId: number) => {
    setTemplateId(newTemplateId); // Update the templateId state
    console.log(templateId)
  };
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

    const [sidebarVisible, setSidebarVisible] = useState(true);

    const toggleSidebar = () => {
      setSidebarVisible(!sidebarVisible);
    };

    return (
        <div className="h-full bg-gray-900">
        <SaveEditTemplate
        code={code}
        forkedTemplateId={forkedId}             //don't need
        editTemplateId={templateId}             //need to pass this
        newlySavedTemplate={handleTemplateSaved} // Pass the callback here
      />
            <div
            className={`bg-gray-800 text-white w-64 min-h-screen p-6 fixed top-0 left-0 transition-all duration-400 ${
                sidebarVisible ? 'translate-x-0' : '-translate-x-full'
            }`}
            >
            <Sidebar />
            </div>
  
  
            <main
            className={`p-6 transition-all duration-400 ${
                sidebarVisible ? 'flex-1 ml-64' : 'flex-1 ml-0'
            }`}
            >
            <button
                onClick={toggleSidebar}
                className="bg-gray-800 text-white p-2 mb-4"
            >
                {sidebarVisible ? '☰' : '☰'}
            </button>
                <section id="code-editor" className="p-4 bg-gray-900 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl">Code Editor</h2>
                        <select 
                            id="language-select" 
                            className="p-2 border border-gray-800 bg-gray-700 rounded-md"
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
                        className="w-full h-[50vh] p-1 mb-4 bg-gray-800 border border-gray-700 rounded-md"

                    />
                
                    <textarea
                        id="code-field" 
                        className="w-full p-2 mb-4 bg-gray-800 border border-gray-700 rounded" 
                        placeholder="Input field"
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                    />

                    <button 
                        className="p-2 bg-gray-700 rounded"
                        onClick={handleExecute}
                    >
                        Execute
                    </button>

                    <div id="code-output" className="w-full p-4 bg-gray-800 border border-gray-600 rounded mt-4">
                        {output || 'Output will be shown here...'}
                    </div>

                    <div id="code-output" className="w-full p-4 bg-gray-800 border border-gray-600 rounded mt-4">
                        {error|| 'Errors will be shown here...'}
                    </div>

                </section>
            
            </main>
  
  
      </div>

       
    );
};

export default CodeEditor;
