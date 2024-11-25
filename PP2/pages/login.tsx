import React, { useEffect, useState ,ChangeEvent} from "react";
import { useRouter } from 'next/router'
import Link from "next/link";
interface FormProps {
   
    username: String,
    password: String,
    token: String
}
//can get rid of the interface since not a component
const LoginPage: React.FC<FormProps>=()=>{
    const router=useRouter()
    //Data to be sent to Login API Handler
    const [formData, setFormData] = useState({
        username: '',
        password: '',
      });
      //Stores any errors returned from API Handler, displayed to the user
      const [error,setError]=useState<String | null>(null)
      //Function Sets form field to be inputted value
      const fieldChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
      const handleSubmit = async (e:React.FormEvent) =>{
        console.log(formData)
        e.preventDefault()
        try{
            const resp = await fetch('/api/User/Login',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(formData)
            })

            const data=await resp.json()

            if(resp.ok){
                console.log(data)
                localStorage.setItem('accessToken',data.token.accessToken)
                localStorage.setItem('refreshToken',data.token.refreshToken)
                router.push('/')
            }else{
                setError(data.error)
            }
        }catch(err:any){
            setError("error logging in")
        }
      }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        {/* Login Panel */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          
          {/* Form */}
          <form action="#" method="POST" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={fieldChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
  
  
            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={fieldChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
              
            >
              Login
            </button>
            <p> Don't have an account? </p> <Link href="/signup"> Sign Up</Link>
            
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        </div>
      </div>
    )
}

export default LoginPage