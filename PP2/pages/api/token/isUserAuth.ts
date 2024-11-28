import { verifyAccessToken} from "@/utils/auth"
import prisma from "@/utils/db"
import { NextApiRequest, NextApiResponse } from "next";
//maybe put in the midleware folder
export default async  function UserAuth(req:NextApiRequest,res:NextApiResponse){
    const auth_header=req.headers.authorization
            if(!auth_header){
                return res.status(401).json({message:"provide access token"})
            }

            const user=await verifyAccessToken(auth_header)     //returns the user if success

            if(!user){
                return res.status(403).json({error:"Authentication unsuccessful"})
            }

            const userInfo=await prisma.user.findUnique({
                where:{
                    id:user.id
                },
                select:{
                id:true,
                userName:true,
                firstName:true,
                lastName:true,
                email:true,
                avatar:true,
                phoneNum:true,
                role:true
                }
            })
            return res.status(200).json(userInfo)
}