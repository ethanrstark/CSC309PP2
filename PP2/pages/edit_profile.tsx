import React, { useState, useEffect , ChangeEvent,useRef} from "react";
import { useRouter } from "next/router";
import Link from "next/link";


interface FormProps {
    email: string,
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    phone:string,
    role:string,
    avatar:string | File,
    
    
}
const EditProfilePage: React.FC<FormProps>=()=>{
    const router=useRouter()
    const avatarinputRef = useRef<HTMLInputElement | null>(null)
     //Stores the user data as inputted from the form fields
    const [formData, setFormData] = useState<FormProps>({
        email: '',
        firstname: '',
        lastname: '',
        username: '',
        password: '',
        role:'',
        phone:'',
        avatar:''
      });
      //Stores the current user data from the db
      const [currUserData, setcurrUserData] = useState <FormProps>({
        email: '',
        firstname: '',
        lastname: '',
        username: '',
        password: '',
        role:'',
        phone:'',
        avatar:''
      });
      //Stores any error and displays it
      const [error,setError]=useState<String | null>(null)
      //True if user clicked submit edit profile form
      const [clickedSubmit,setclickedSubmit]=useState<boolean>(false)
      //Use to send data as form-data, not as raw body data
      const userData=new FormData()

      //Function to validate the user's access token. If it has expired, will validate the refresh token and try to generate a new access token
//If refresh token also expired, goes to login page
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
        return data
    
      

    }else{
        const refreshResp=await fetch('/api/User/Refresh',{
            method:'GET',
            headers:{
                authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
               
            }
        })
        console.log(refreshResp)
        const data=await refreshResp.json()
        if(refreshResp.ok){
            
           localStorage.setItem("accessToken",data.accessToken)
           return data
        } else{
             router.push('\login')
        }
       
    }
    
        }catch(err:any){
            console.error(err)
        }
    }
    const fetchUserData = async ()=>{
        
        try{
        /*     console.log(localStorage.getItem("accessToken"))
            const response = await fetch('/api/token/isUserAuth',{
        headers:{
            authorization:`Bearer ${localStorage.getItem("accessToken")}`}
    }) */
    const userData=await handleAuthen()
    console.log(userData)
    //if(response.ok){
        setcurrUserData({
            username:userData.userName,
            email:userData.email,
            firstname:userData.firstName,
            lastname:userData.lastName,
            password:userData.password,
            phone:userData.phoneNum,
            role:userData .role,
            avatar:userData.avatar
        })

        setFormData({
            email: userData.email,
            firstname: userData.firstName,
            lastname: userData.lastName,
            username: userData.userName,
            password: '',
            phone: userData.phoneNum,
            role: userData.role,
            avatar: userData.avatar,
        })

        console.log(currUserData)
        console.log(formData)
    /* }else{
        router.push('/login')
        //setError('Invalid authentication')
    } */
        }catch(err:any){
            console.error(err)
            setError('Invalid fetching of user data')
        }
    }
    
   
    useEffect(()=>{
        console.log(1)
        fetchUserData()
    },[clickedSubmit]

    )
    

      const fieldChange = (e: ChangeEvent<HTMLInputElement>) => {
        //const { name, value } = e.target;
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

      const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
          setFormData((prevData) => ({
            ...prevData,
            avatar: file||'' // store the file object in the state
          }));
        
      };
      const handleSubmit = async (e:React.FormEvent) =>{
        console.log(formData)
        e.preventDefault()
            try{

                Object.keys(formData).forEach(key => {
                    const value = formData[key as keyof FormProps]; // Assert key is of type keyof FormProps
                    const currentValue = currUserData[key as keyof FormProps];
                        if (value !==currentValue && value!=='') {
                            if(value instanceof File && key==="avatar"){
                                userData.append(key,value)
                            }else{
                                userData.append(key, value);
                            }
                        
                        }
                    });
                   
          
            const resp = await fetch(`/api/User/${currUserData.username}`,{
                method:'PUT',
                headers:{
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                
                },
                body:userData
            })

            const data=await resp.json()
                console.log(data)
                console.log(resp)
            if(resp.ok){
                setFormData({
                    email: data.email,
                    firstname: data.firstName,
                    lastname: data.lastName,
                    username: data.userName,
                    password: "",
                    phone: data.phoneNum,
                    role: data.role,
                    avatar: "",
                    
                })
                setcurrUserData({
                  email: data.email,
                  firstname: data.firstName,
                  lastname: data.lastName,
                  username: data.userName,
                  password: data.password, 
                  phone: data.phoneNum,
                  role: data.role,
                  avatar: data.avatar
                  
              })
                if(avatarinputRef.current!==null){
                  avatarinputRef.current.value=""

                }
                setError("Update successful!")
                
                console.log(data)
                router.push('/')
            }
            else if(resp.status===403){
                //authen unsucessful, redirect to refresh, if doesn't work go to login page
                const refreshResp=await fetch('/api/User/Refresh',{
                    method:'GET',
                    headers:{
                        authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
                       
                    }
                }) 
                const token=await refreshResp.json()
                if(refreshResp.ok){
                   // continue editing profile
                   localStorage.setItem("accessToken",token.accessToken)
                   const resp = await fetch(`/api/User/${currUserData.username}`,{
                    method:'PUT',
                    headers:{
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    
                    },
                    body:userData
                })
    
                const data=await resp.json()
                    console.log(data)
                    console.log(resp)
                if(resp.ok){
                    setFormData({
                        email: data.email,
                        firstname: data.firstName,
                        lastname: data.lastName,
                        username: data.userName,
                        password: "",
                        phone: data.phoneNum,
                        role: data.role,
                        avatar: "",
                        
                    })
                    setcurrUserData({
                      email: data.email,
                      firstname: data.firstName,
                      lastname: data.lastName,
                      username: data.userName,
                      password: data.password,
                      phone: data.phoneNum,
                      role: data.role,
                      avatar: data.avatar
                      
                  })
                    if(avatarinputRef.current!==null){
                      avatarinputRef.current.value=""
    
                    }
                    setError(null)
              }else{
                    setError(data.error)
                  } 
                     
                } else{
                     router.push('\login')
                }
            }else{
                console.log(resp)
                setError(data.error)
            }
        }catch(err){
            setError("error editing account")
        }
      }
      //make so that displays role but can't edit it
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-900">
  <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
  
    <h2 className="text-2xl font-bold text-center mb-6 text-white">Edit Profile</h2>
    
    <form onSubmit={handleSubmit}>
      {/* First Name */}
      <div className="mb-4">
        <label htmlFor="firstname" className="block text-sm font-semibold text-gray-300">
          First Name
        </label>
        <input
          type="text"
          id="firstname"
          name="firstname"
          value={formData.firstname}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label htmlFor="lastname" className="block text-sm font-semibold text-gray-300">
          Last Name
        </label>
        <input
          type="text"
          id="lastname"
          name="lastname"
          value={formData.lastname}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Role */}
      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-semibold text-gray-300">
          Role
        </label>
        <input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-300">
          Phone
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-semibold text-gray-300">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {/* Avatar Upload */}
      <div className="mb-4">
        <label htmlFor="avatar" className="block text-sm font-semibold text-gray-300">
          Avatar Image
        </label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          ref={avatarinputRef}
          onChange={fileChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
        />
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
        onClick={() => setclickedSubmit(true)}
      >
        Update Profile
      </button>
    </form>
  </div>
</div>
    )
}

export default EditProfilePage