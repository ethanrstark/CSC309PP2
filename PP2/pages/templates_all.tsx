import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select'; // To handle multi-select for tags
import { components } from 'react-select';
import { title } from 'process';

// Custom components for react-select to allow for tag creation
const customSingleValue = ({ data }: any) => <div>{data.label}</div>;

export default function TemplatesAllPage() {
  const router = useRouter();
  //Stores all the templates from db
  const [templates, setTemplates] = useState<any[]>([]);
  //Whether there are templates or not
 const [noTemplates,setNoTemplates]=useState<boolean>(false)
 //Stores all possible tags from db
  const [tags, setTags] = useState<any[]>([]);
  //Filters applied on templates
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [titleFilter, setTitleFilter] = useState<string>('');
  const [descriptionFilter, setDescriptionFilter] = useState<string>('');
  //Paginated templates
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  //Paginated tags
    const [tagPage,setTagPage]=useState<number>(1)
    const [totalTagPage,settotalTagPage]=useState<number>(1)

  // Function to fetch code templates based on filters
  const fetchTemplates = async () => {
   
   let url = `/api/CodeTemplate/Search_all?page=${page}`;

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
        queryParams.append('tags', selectedTags.map(tag => tag.value).join(',')); 
    }

    // Append the query parameters to the base URL
    if (queryParams.toString()) {
        url += '&' + queryParams.toString();
    }
console.log(queryParams)
    try{
         const res = await fetch(url,
    
    {
        method: 'GET',
        cache: 'no-store', 
      }
 
   
);
console.log(res)
    
   // console.log(data)
    console.log(templates)
     const data = await res.json();
     console.log(data)
     //console.log(data.pagedTemplates.length)
     if (res.status===201){
        //if(data.paged_templates && data.paged_templates.length>0){
       
        setTemplates(data.pagedTemplates)
        setTotalPages(Math.ceil(parseInt(data.numTemp)/2))
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

     
     
       
    //console.log(templates)
    }catch(err:any){
        console.error(err)
    }
  
    
   
  };

  // Fetch tags for multi-select
  //depends on tagpage changing
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

  useEffect(() => {
    fetchTemplates();
    fetchTags();
  }, [page, titleFilter, descriptionFilter, selectedTags]);

  useEffect(()=>{
    fetchTags()
  },[tagPage])

  //Update query params within url
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

    //page reload query params persist
  useEffect(() => {
    if (router.isReady) {
   //setFilters(router.query);
   console.log(10)
   console.log(router.query)
   const queryTags = router.query.tags;
      if (typeof queryTags === 'string') {
        // If the query tags are a string, split them into an array
        setSelectedTags(queryTags.split(',').map((tag) => ({ label: tag, value: tag })));
      }
   setTitleFilter(typeof router.query.title === 'string' ? router.query.title : '')
   setDescriptionFilter(typeof router.query.description === 'string' ? router.query.description : '')
   setPage(typeof router.query.page === 'string' ? parseInt(router.query.page) : 1) 
   //setTags(Array.isArray(router.query.tags) ? router.query.tags : router.query.tags ? [router.query.tags] : [])   //tags or selectedTags?

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

const redirectToEditor = (templateId:number) => {
      
  router.push(`/editor?forkedId=${templateId}`); // Use router.push to navigate to the editor page

};
  return (
   
    <div className="min-h-screen bg-gray-900 text-white">
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      rel="stylesheet"
    />
    {/* Search Bar Section */}
    <div className="container mx-auto px-4 py-6 flex flex-wrap mb-4">
      {/* Search by Title */}
      <div className="flex flex-col w-full md:w-1/3 mr-4 mb-4 md:mb-0">
        <label htmlFor="titleSearch" className="text-sm font-semibold text-gray-300">
          Search by Title:
        </label>
        <input
          id="titleSearch"
          type="text"
          className="mt-1 block w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          placeholder="Search by title"
        />
      </div>
  
      {/* Search by Description */}
      <div className="flex flex-col w-full md:w-1/3 mr-4 mb-4 md:mb-0">
        <label htmlFor="descriptionSearch" className="text-sm font-semibold text-gray-300">
          Search by Description:
        </label>
        <input
          id="descriptionSearch"
          type="text"
          className="mt-1 block w-full px-4 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"
          value={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder="Search by description"
        />
      </div>
  
      {/* Filter by Tags */}
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
            <i className="fas fa-chevron-left"></i> {/* Left arrow icon */}
          </button>
          <span className="text-gray-300">Page {tagPage} of {totalTagPage}</span>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition duration-200 disabled:bg-gray-300"
            onClick={() => handleTagPageChange(tagPage + 1)}
            disabled={tagPage === totalTagPage}
          >
            <i className="fas fa-chevron-right"></i> {/* Right arrow icon */}
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
            <tr className="border-b border-gray-700">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Owner</th>
              <th className="px-4 py-2 text-left">Last Modified</th>
              <th className="px-4 py-2 text-left">Tags</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(templates || []).map((template) => (
              <tr key={template.id} className="border-t border-gray-700">
                <td className="px-4 py-2">{template.title}</td>
                <td className="px-4 py-2">{template.explanation}</td>
                <td className="px-4 py-2">{template.user.userName}</td>
                <td className="px-4 py-2">{new Date(template.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {/* Display tags */}
                  <div className="flex flex-wrap gap-2">
                    {template.tags && template.tags.length > 0 ? (
                      template.tags.map((tag: { name: string; id: number }) => (
                        <span
                          key={tag.id}
                          className="bg-gray-600 text-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No Tags</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  <button className="text-green-500 hover:text-green-700" onClick={()=>redirectToEditor(template.id)}>
                    <i className="fas fa-play-circle"></i> {/* Play icon */}
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
  );
}