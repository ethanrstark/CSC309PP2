import React, { useEffect, useState ,ChangeEvent} from "react";
import { useRouter } from 'next/router'
import Link from "next/link";
interface FormProps {
    email: String,
    firstName: String,
    lastName: String,
    userName: String,
    password: String
}
const SignUpPage: React.FC<FormProps>=()=>{

    const router=useRouter()
    //Data to be sent to the SignUp API Handler
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        userName: '',
        password: '',
      });
      //Stores any errors returned from API Handler, displayed to the user
      const [error,setError]=useState<String | null>(null)
      //Sets the form field to inputted value
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
            const resp = await fetch('/api/User/SignUp',{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(formData)
            })

            const data=await resp.json()

            if(resp.ok){
                console.log(data)
                router.push('/login')
            }else{
                setError(data.error)
            }
        }catch(err:any){
            setError("error creating new account")
        }
      }
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center p-6">
  {/* Login Panel */}
  <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
    <h2 className="text-2xl font-bold text-center mb-6 text-white">Create Account</h2>

    {/* Form */}
    <form action="#" method="POST" onSubmit={handleSubmit}>
      {/* First Name */}
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-300">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
          required
        />
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-300">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
          required
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
          required
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-semibold text-gray-300">
          Username
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          value={formData.userName}
          onChange={fieldChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
          required
        />
      </div>

      {/* Password */}
      <div className="mb-6">
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
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
      >
        Sign Up
      </button>

      <div className="text-center mt-4 text-gray-400">
        <p>Already have an account?</p>
        <Link href="/login" className="text-blue-400 hover:text-blue-500">
          Login
        </Link>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </form>
  </div>
</div>
    )
}

export default SignUpPage