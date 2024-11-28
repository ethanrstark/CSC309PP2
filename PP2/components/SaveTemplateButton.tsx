import React, { useState, useEffect , ChangeEvent} from "react";
import { useRouter } from "next/router";

interface FormProps {
    title: string,
    explanation: string,
    file_name: string,
    language: string,
    code: string,
   
}

//Args to pass into the component
interface Props {
    code: string,
    forkedTemplateId?: number|null ,      //For forked templates (optional)
    editTemplateId?: number|null,         //Editing a template (optional)
    newlySavedTemplate: (newTemplateId: number) => void     //callback function to return templateId of a newly created template
}

const SaveEditTemplate: React.FC<Props>=({code,forkedTemplateId, editTemplateId,newlySavedTemplate})=>{
    const router=useRouter()
 
    const [formData, setFormData] = useState<FormProps>({
        title: '',
        explanation: '',
        file_name: '',
        language: '',
        code: code
      });
   
      
      const [error,setError]=useState<String | null>(null)
      
      const [saveTemplatePopUp,setSaveTemplatePopUp]=useState<boolean>(false)


      const handleAuthen=async()=>{
        try{
            console.log(localStorage.getItem("accessToken"))
            const response = await fetch('/api/token/isUserAuth',{
                method:'GET',
        headers:{
            authorization:`Bearer ${localStorage.getItem("accessToken")}`},
            
    })
    const data=await response.json()
    console.log(response)
    if(response.ok){
        
    
      

    }else{
        const refreshResp=await fetch('/api/User/Refresh',{
            method:'GET',
            headers:{
                authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
               
            }
        })
        
        
        if(refreshResp.ok){
            const data = await refreshResp.json()
           localStorage.setItem("accessToken",data.accessToken)
        } else{
            
             router.push('\login')
        }
       
    }
        }catch(err){
            console.error(err)
        }
    }

    const saveTemplate = async (e: React.FormEvent) => {
        e.preventDefault()
        handleAuthen()
         
                 try{
                  let url = `/api/CodeTemplate/Save/`
                
          if (forkedTemplateId){    //forked a template
            url += '?id='+forkedTemplateId
            const res = await fetch(url,
          
          {
              method: 'POST',
              headers:{
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                'Content-Type': 'application/json'
            
            },
            body:JSON.stringify(formData)
           
        })
        const data=await res.json()
        console.log(data.message)
        if (res.ok){
          setFormData({
            title:'',
            explanation:'',
            file_name:'',
            language:'',
            code:code
        })

        //return the template id of created code template
        newlySavedTemplate(parseInt(data.id,10))
        setSaveTemplatePopUp(false)
        }else{
          setError(data.message)
          
        }


          }else{    //creating brand new code template
            const res = await fetch(url,
          
              {
                  method: 'POST',
                  headers:{
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json'
                
                },
                body:JSON.stringify(formData)
               
            })
            const data=await res.json()
            console.log(data)
        if (res.ok){
          setFormData({
            title:'',
            explanation:'',
            file_name:'',
            language:'',
            code:code
        })

        //return the template id of created code template
        newlySavedTemplate(parseInt(data.id,10))
        setSaveTemplatePopUp(false)
        }else{
          setError(data.message)
        }

          }
        }catch(err:any){
          console.error(error)
        }
      }
               
       
        const handleEditTemplate = async (e: React.FormEvent)=>{
            e.preventDefault()
    
            handleAuthen()
             
            try{
               
               
            const res = await fetch(`/api/CodeTemplate/Edit/${editTemplateId}`,{
                    method:'POST',
                
                headers:{
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json',
                
                },body: JSON.stringify({code:code})
            }
                )
                const data=await res.json()
                console.log(res)
                console.log(data)
                if (res.ok){
                    
                   
                }else{
                    console.error("error edit")
                }
            }catch(err:any){
                console.error("error with template edit",err)
            }
            
        
            
    
        }
    
    

      const fieldChange = (e: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        //const { name, value } = e.target;
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

    
   
     
    return (
        <> 
        <button className="text-black hover:text-gray-400 flex items-center space-x-2 rounded-lg border-2 border-gray-600 px-4 py-2 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" onClick={(e)=>{
          handleAuthen()
          
            if (editTemplateId){
            handleEditTemplate(e)
          }else{
            
            setSaveTemplatePopUp(true)
          }
          
          
            }}>
           Save 
            </button>
        {saveTemplatePopUp && (
            <>
            <div className="min-h-screen flex justify-center items-center p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Save</h2>

    

        <form onSubmit={(e: React.FormEvent)=> {
            saveTemplate(e)}}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={fieldChange}
              className="mt-1 text-black block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="explanation" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={fieldChange}
              className="mt-1 text-black block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>

          {/* File Name */}
          <div className="mb-4">
            <label htmlFor="file_name" className="block text-sm font-semibold text-gray-700">
              File Name
            </label>
            <input
              type="file_name"
              id="file_name"
              name="file_name"
              value={formData.file_name}
              onChange={fieldChange}
              className="mt-1 text-black block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             
            />
          </div>

          {/* Language */}
          <div className="mb-4">
                  <label htmlFor="language" className="block text-sm font-semibold text-gray-700">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={fieldChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Language</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">PYTHON</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="rust">Rust</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="swift">Swift</option>
                    <option value="php">PHP</option>
                  </select>
                </div>
          
            
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
          
          >
            Save
          </button>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
           onClick={()=>{
            setFormData( {
              title: '',
              explanation: '',
              file_name: '',
              language: '',
              code: code})
            setSaveTemplatePopUp(false)}}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
    </>
    )}
  </>
       
    )}


    export default SaveEditTemplate
