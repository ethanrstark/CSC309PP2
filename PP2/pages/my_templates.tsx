//need to verify that accessToken is valid before cna show the page
//if accessToken not valid, use refreshToken to gen a new accessToken
//if refreshToken invalid, prompt login page

//do all of this when the page is first rendered

import React, { useState, useEffect , ChangeEvent} from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Select from 'react-select'; // To handle multi-select for tags
import { CODE_TEMPLATE_LIMIT } from "@/constants";

const customSingleValue = ({ data }: any) => <div>{data.label}</div>;

export default function My_Templates(){
    const router=useRouter()
    //Stores templates from the db
    const [templates, setTemplates] = useState<any[]>([]);
 const [noTemplates,setNoTemplates]=useState<boolean>(false)

  
  //Template filters
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [titleFilter, setTitleFilter] = useState<string>('');
  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  //Current page
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  //Current tag page
    const [tagPage,setTagPage]=useState<number>(1)
    const [totalTagPage,settotalTagPage]=useState<number>(1)
    const [tags, setTags] = useState<any[]>([]);

    //Delete Template
    const [isPopUpOpen, setPopUpOpen]=useState<boolean>(false)
    const [templateDel,setTemplateDel]=useState<number>(0)

    //Edit Template
    const [isEditPopUpOpen, setEditPopUpOpen]=useState<boolean>(false)
    const [templateEdit, setTemplateEdit]=useState<number>(0)
    //Form to edit template
    const [formData, setFormData] = useState({
        title: '',
        explanation: '',
        tags:[] as string[]
      });
      //Current tag page edit form
      const [tagPageEdit,settagPageEdit]=useState<number>(1)
      const [totalTagPageEdit,settotalTagPageEdit]=useState<number>(1)
      const [editPageTags,setEditPageTags]=useState<any[]>([])

      //Tag to delete for a template
      const [tagDel,setTagDel]=useState<boolean>(false)

      //Verify that access token is valid, if not check refresh token
      //Prompt for login as last resort
  const handleAuthen=async()=>{
        try{
            console.log(localStorage.getItem("accessToken"))
            const response = await fetch('/api/token/isUserAuth',{
                method:'GET',
        headers:{
            authorization:`Bearer ${localStorage.getItem("accessToken")}`},
            
    })
    const data=await response.json()
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
        }catch(err:any){
            console.error(err)
        }
    }

   
        // Function to fetch code templates based on filters
  const fetchTemplates = async () => {
    
     handleAuthen()
     let url = `/api/CodeTemplate/Search?page=${page}`;
  
      // Conditionally append query parameters only if they exist
      const queryParams = new URLSearchParams();
  console.log(titleFilter)
      if (titleFilter!=='') {
          queryParams.append('title', titleFilter);
      }
      if (descriptionFilter!='') {
          queryParams.append('explanation', descriptionFilter);
      }
      console.log(tags)
      if (selectedTags && selectedTags.length > 0) {
          queryParams.append('tags', selectedTags.map(tag => tag.value).join(',')); // Assuming tags is an array
      }
  
      // Append the query parameters to the base URL
      if (queryParams.toString()) {
          url += '&' + queryParams.toString();
      }
  console.log(queryParams)
      try{
           const res = await fetch(url,
      // Start with the base URL
      {
          method: 'GET',
          headers:{
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        
        },
          cache: 'no-store', // You can add cache control or other headers here.
        }
   
     
  );
  console.log(res)
      
     // console.log(data)
      console.log(templates)
       const data = await res.json();
       console.log(data)
      
       if (res.status===403){
        const refreshResp=await fetch('/api/User/Refresh',{
          method:'GET',
          headers:{
              authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
             
          }
      }) 
      const token=await refreshResp.json()
      if (refreshResp.ok){
        localStorage.setItem("accessToken",token.accessToken)
        const res = await fetch(url,
          // Start with the base URL
          {
              method: 'GET',
              headers:{
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            
            },
              cache: 'no-store', // You can add cache control or other headers here.
            }
          )
          const dataTemp=await res.json()
          if(res.status===201){
            setTemplates(dataTemp.pagedTemplates)
          setTotalPages(Math.ceil(parseInt(dataTemp.numTemp)/CODE_TEMPLATE_LIMIT))
          setNoTemplates(false)
        }else{
          if(page>1){
            setPage(page-1)
          }else{
          setTemplates([])
          setNoTemplates(true)
          setTotalPages(1)
        }
      }
      }else{
        router.push('/login')
      }
      
       }
       else if (res.status===201){ 
       
          setTemplates(data.pagedTemplates)
        setTotalPages(Math.ceil(parseInt(data.numTemp)/CODE_TEMPLATE_LIMIT))
        setNoTemplates(false)
      
    
      }else{//no templates found
        if(page>1){
          setPage(page-1)
        }else{
        setTemplates([])
        setNoTemplates(true)
        setTotalPages(1)
      }
        
      }
  
       
       
         
      //console.log(templates)
      }catch(err:any){
          console.error(err)
      }
    
      
     
    };
  
    // Fetch tags for multi-select
    //getch depends on tagpage changing
    const fetchTags = async () => {
      const res = await fetch(`/api/tag/?page=${tagPage}&countTags=true`,{
          method:'GET'
      });       
      const data = await res.json();
      if (data.data) {
        setTags(data.data.map((tag: any) => ({ label: tag.name, value: tag.name })));
        settotalTagPage(Math.ceil(data.tagCount/data.pageLimit))
      }
    };
    //fetch tags for edit form
    const fetchEditTags = async () => {
      const res = await fetch(`/api/tag/?page=${tagPageEdit}&countTags=true`,{
          method:'GET'
      });       
      const data = await res.json();
      if (data.data) {
        setEditPageTags(data.data.map((tag: any) => ({ label: tag.name, value: tag.name })));
        settotalTagPageEdit(Math.ceil(data.tagCount/data.pageLimit))
      }
    };
  
    useEffect(() => {
      fetchTemplates();
      fetchTags();
    }, [page, titleFilter, descriptionFilter, selectedTags,templateDel,templateEdit,tagDel]);
  
    //re-fetch list of tags if the tag page filter 
    useEffect(()=>{
      fetchTags()
    },[tagPage])    

     //re-fetch list of tags if the edit tag page changes
     useEffect(()=>{
      fetchEditTags()
    },[tagPageEdit]) 

    useEffect(()=>{
        if(router.isReady){
            const query: Record<string, string> = { page: page.toString() }
            if(titleFilter !==''){
                query.title=titleFilter
            }
            if(descriptionFilter!==''){
                query.description=descriptionFilter
            }
            if (selectedTags.length>0){
                query.tags=selectedTags.map(tag => tag.value).join(',')
            }
            router.push({pathname:router.pathname,query},undefined,{shallow:true})
        }
      },[page,titleFilter,descriptionFilter,selectedTags])
    
      //on page reload, persist filters. make sure user authenticated
      useEffect(() => {
        if (router.isReady) {
       //setFilters(router.query);
       console.log(10)
       console.log(router.query)
       handleAuthen()
       const queryTags = router.query.tags;
      if (typeof queryTags === 'string') {
        // If the query tags are a string, split them into an array
        setSelectedTags(queryTags.split(',').map((tag) => ({ label: tag, value: tag })));
      }
       setTitleFilter(typeof router.query.title === 'string' ? router.query.title : '')
       setDescriptionFilter(typeof router.query.description === 'string' ? router.query.description : '')
       setPage(typeof router.query.page === 'string' ? parseInt(router.query.page) : 1) 
    
       }
         }, [router.isReady,router.query.title,router.query.description,router.query.page,router.query.tags]);

        
      // Handle page change
      const handlePageChange = (newPage: number) => {
        setPage(newPage);
      };
    
      // Handle tag selection
      const handleTagChange = (selectedOptions: any) => {
        setSelectedTags(selectedOptions || []);
      };
      //Handle tag page change
    const handleTagPageChange = (newPage:number)=>{
        setTagPage(newPage)
    }

    const handleDeleteTemplate = async ()=>{
        handleAuthen()
        
        try{
          
        const res = await fetch(`/api/CodeTemplate/Delete/${templateDel}`,{
                method:'DELETE',
            
            headers:{
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            
            },
            }
            )
            const data=res.json()
            if (res.ok){
                const existTemp=templates.filter((template) => template.id !== templateDel)
                //triggers re-fetch of templates
                setTemplates(existTemp)
                setPopUpOpen(false)
                console.log(existTemp)
                if (existTemp.length === 0 && page > 1) {
                    // If there are no templates on the current page and we're not on the first page, go to the previous page
                    setPage(page - 1);
                  }
            }else{
                console.error("error deletion")
            }
        }catch(err:any){
            console.error("error with template deletion",err)
        }
        
    
    }
    //Edits template info through a pop up form
    const handleEditTemplate = async (e: React.FormEvent)=>{
        e.preventDefault()

        handleAuthen()
        
        try{
            console.log(formData)
            const tagValues = formData.tags ? formData.tags.map((tag: any) => tag.value) : [];
            const updatedFormData: Record<string, any> = {};

    // Loop through formData and only include fields that have a value (not empty)
    if (formData.title !== '') updatedFormData.title = formData.title;
    if (formData.explanation !== '') updatedFormData.explanation = formData.explanation;
    if (tagValues.length > 0) updatedFormData.tags = tagValues; 
            /* setFormData((prevData) => ({
                ...prevData,
                tags: tagValues,  // Update formData.tags to an array of strings, need to value and for formdata to display proeprly
              })); */
        const res = await fetch(`/api/CodeTemplate/Edit/${templateEdit}`,{
                method:'POST',
            
            headers:{
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                'Content-Type': 'application/json',
            
            },body: JSON.stringify(updatedFormData)
        }
            )
            const data=res.json()
            if (res.ok){
                //const existTemp=templates.filter((template) => template.id !== templateDel)
                //setTemplates(existTemp)
                setEditPopUpOpen(false)
                setTemplateEdit(0)
                settagPageEdit(1)
                setFormData({
                    title:'',
                    explanation:'',
                    tags:[]
                })
                //console.log(existTemp)
               
            }else{
                console.error("error edit")
            }
        }catch(err:any){
            console.error("error with template edit",err)
        }
        
        
        

    }
    //Pagniated tags on the edit pop-up
    const handleTagPageChangeEdit = (newPage:number)=>{
        settagPageEdit(newPage)
    }
    //Field change on the edit form
    const fieldChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

        //Tag selection on the edit form
      const handleTagSelectChange = (selectedTags: any) => {
        const tagValues = selectedTags ? selectedTags.map((tag: any) => tag.value) : [];
        setFormData((prevData) => ({
          ...prevData,
          tags: selectedTags||[],  // Update formData.tags to an array of strings, need to value and for formdata to display proeprly
        }));

        console.log(formData)
      };

    const handleCancelEdit = () =>{
        setEditPopUpOpen(false)
    }
    const handleCancelDelete = () =>{
        setPopUpOpen(false)
    }
    //Handle tag deletion on a template
    const handleTagRemove=async (template:number,id:number)=>{
      handleAuthen()
        console.log(template)
        const res = await fetch(`/api/CodeTemplate/Tag/${id}?templateId=${template}`,{
            method:'DELETE',
        
        headers:{
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            
        
        }
    }
        )
        if(res.ok){
            setTemplates((prevTemplates) =>
                prevTemplates.map((template) =>
                  template.id === template
                    ? {
                        ...template,
                        tags: template.tags.filter((tag:any) => tag.id !== id),
                      }
                    : template
                )
              )
              setTagDel(false)   
        }

    }

    const redirectToEditor = (templateId:number) => {
      
          router.push(`/editor?templateId=${templateId}`); // Use router.push to navigate to the editor page
      
  };

  const redirectToDetails = (templateId:number,userName:string)=>{
    router.push(`/ViewTemplate/${templateId}?userName=${userName}`); // Use router.push to navigate to the view template page
  
  }
      return (
       
        <div className="min-h-screen bg-gray-900 text-white">
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          rel="stylesheet"
        />
      
  
        <div className="container mx-auto px-4 py-6">
          <div className="flex mb-4">
            {/* Search Bar Section */}
            <div className="flex flex-col w-full md:w-1/3 mr-4">
              <label htmlFor="titleSearch" className="text-sm font-semibold text-gray-300">
                Search by Title:
              </label>
              <input
                id="titleSearch"
                type="text"
                className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Search by title"
              />
            </div>
      
            <div className="flex flex-col w-full md:w-1/3 mr-4">
              <label htmlFor="descriptionSearch" className="text-sm font-semibold text-gray-300">
                Search by Description:
              </label>
              <input
                id="descriptionSearch"
                type="text"
                className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                value={descriptionFilter}
                onChange={(e) => setDescriptionFilter(e.target.value)}
                placeholder="Search by description"
              />
            </div>
      
            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="tagsSearch" className="text-sm font-semibold text-gray-300">
                Filter by Tags:
              </label>
              <Select
                isMulti
                value={selectedTags}
                onChange={handleTagChange}
                options={tags}
                className="mt-1"
                classNamePrefix="react-select"
                placeholder="Select tags"
                components={{ SingleValue: customSingleValue }}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#2D3748', // Dark background for the select input
                    borderColor: '#4A5568', // Dark border for the select input
                  }),
                  option: (provided) => ({
                    ...provided,
                    backgroundColor: '#4A5568', // Dark background for options
                    color: '#E2E8F0', // Light color for option text
                  }),
                }}
              />
              <div className="flex justify-between mt-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition duration-200 disabled:bg-gray-300"
                  onClick={() => handleTagPageChange(tagPage - 1)}
                  disabled={tagPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="text-gray-300">Page {tagPage} of {totalTagPage}</span>
                
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition duration-200 disabled:bg-gray-300"
                  onClick={() => handleTagPageChange(tagPage + 1)}
                  disabled={tagPage === totalTagPage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        
          {/* Template Table */}
          {noTemplates ? (
            <div className="text-center p-4">
              <p className="text-lg text-gray-500">No Templates Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto bg-gray-800 text-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Owner</th>
                    <th className="px-4 py-2 text-left">Last Modified</th>
                    <th className="px-4 py-2 text-left">Tags</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                    <th className="px-4 py-2 text-left">View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-t border-gray-700">
                      <td className="px-4 py-2">{template.title}</td>
                      <td className="px-4 py-2">{template.explanation}</td>
                      <td className="px-4 py-2">{template.user.userName}</td>
                      <td className="px-4 py-2">{new Date(template.updatedAt).toLocaleDateString()}</td>
                      
                      {/* Display tags */}
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {template.tags && template.tags.length > 0 ? (
                            template.tags.map((tag:{name:string,id:number}) => (
                              <span
                                key={tag.id}
                                className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm"
                              >
                                {tag.name}
                                <button
                                  onClick={() => {setTagDel(true); handleTagRemove(template.id, tag.id)}}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No Tags</span>
                          )}
                        </div>
                      </td>
      
                      <td className="px-4 py-2 text-center">
                        <div className="flex space-x-4">
                        
                          <button className="text-green-500 hover:text-green-700 flex items-center space-x-2"
                          onClick={()=>redirectToEditor(template.id)}>
                            <i className="fas fa-play-circle"></i>
                            
                          </button>
                         
                          <button
                            className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                            onClick={() => {setTemplateDel(template.id); setPopUpOpen(true)}}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                            onClick={() => {setTemplateEdit(template.id); setEditPopUpOpen(true)}}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                        </div>
                      </td> 
                      <td className="px-4 py-2 text-center">
                  <button className="text-green-500 hover:text-green-700" onClick={()=>redirectToDetails(template.id,template.user.userName)}>
                  <i className="fas fa-solid fa-list"></i>
                  </button>
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-600 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Previous
            </button>
      
            <span className="text-gray-300">Page {page} of {totalPages}</span>
      
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="bg-gray-600 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      
        {/* Delete Confirmation Popup */}
        {isPopUpOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold text-gray-700">Are you sure you want to delete this template?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleDeleteTemplate}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      
        {/* Edit Template Popup */}
        {isEditPopUpOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 text-gray-800">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-6">Edit Template</h2>
      
              <form action="#" method="POST" onSubmit={handleEditTemplate}>
                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                    New Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={fieldChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
      
                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="explanation" className="block text-sm font-semibold text-gray-700">
                    New Description
                  </label>
                  <input
                    type="text"
                    id="explanation"
                    name="explanation"
                    value={formData.explanation}
                    onChange={fieldChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
      
                {/* Tags */}
                <div className="flex flex-col">
                  <label htmlFor="tags" className="text-sm font-semibold text-gray-700">Add Tags</label>
                  <Select
                    id="tags"
                    name="tags"
                    isMulti
                    options={editPageTags}
                    value={formData.tags}
                    onChange={handleTagSelectChange}
                    className="mt-1"
                    classNamePrefix="react-select"
                  />
                </div>
      
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
                    onClick={() => handleTagPageChangeEdit(tagPageEdit - 1)}
                    disabled={tagPageEdit === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="text-gray-700">Page {tagPageEdit} of {totalTagPageEdit}</span>
                  
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
                    onClick={() => handleTagPageChangeEdit(tagPageEdit + 1)}
                    disabled={tagPageEdit === totalTagPageEdit}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
      
                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Done
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      );
}