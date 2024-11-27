
import React from "react";
import { useRouter } from "next/router";
//import {getToken,verification} from "@/components/App"
const LogOut = () => {
    const router=useRouter()
  const handleLogout=async()=>{
        try{
            console.log(localStorage.getItem("accessToken"))
            const response = await fetch('/api/token/isUserAuth',{
                method:'GET',
        headers:{
            authorization:`Bearer ${localStorage.getItem("accessToken")}`},
            
    })
    const data=await response.json()
    if(response.ok){
        const accessResp=await fetch('/api/User/LogOut',{
            method:'POST',
        headers:{
            authorization:`Bearer ${localStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({"refreshToken":localStorage.getItem("refreshToken")})
    })
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    router.push('/')
    }else{
        const refreshResp=await fetch('/api/User/Refresh',{
            method:'GET',
            headers:{
                authorization:`Bearer ${localStorage.getItem("refreshToken")}`,
               
            }
        }) 
        const token=await refreshResp.json()
        if(refreshResp.ok){
            localStorage.setItem("accessToken",token.accessToken)
            const accessResp=await fetch('/api/User/LogOut',{
                method:'POST',
            headers:{
                authorization:`Bearer ${localStorage.getItem("accessToken")}`,
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({"refreshToken":localStorage.getItem("refreshToken")})
        })
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
             router.push('/')
        } else{
            localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
             router.push('\login')
        }
        
       
    }
        }catch(err){
            console.error(err)
        }
    }
        return (
            <div>
                <button className="text-gray-300 hover:text-gray-400 flex items-center space-x-2 rounded-lg border-2 border-gray-600 px-4 py-2 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" onClick={handleLogout}> LogOut</button>
            </div>
        )
    
}

export default LogOut