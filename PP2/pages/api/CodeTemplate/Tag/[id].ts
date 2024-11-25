import prisma from "@/utils/db"
import { AuthenticatedRequest } from "@/constants";
import { NextApiResponse } from "next";
import { verification} from "@/middleware/auth"


async function handler(req:AuthenticatedRequest,res:NextApiResponse){
    if (req.method !== "DELETE") {
        res.setHeader("Allow", ["DELETE"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    try{
       

        const templateId=parseInt(req.query.templateId as string, 10)

        if (isNaN(templateId)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        const tagId = parseInt(req.query.id as string, 10)

        if (isNaN(tagId)) {
            return res.status(400).json({ error: "Invalid tag ID" });
        }

        console.log(tagId)

        const template = await prisma.codeTemplate.findUnique({
        where:{
            id:templateId
         },include:{
             tags:true,
         }
           
         
        })

        

    if(!template){
        return res.status(404).json({error:"Code Template does not exist"})
    }
  /*   if (template.userId!==req.user.userId){
        return res.status(400).json({error:"No edit access"})
    } */
   const remove_tag=await prisma.tag.findUnique({
            where:{
                id:tagId
            }
        })
    
    if(!remove_tag){
            return res.status(404).json({error:"Tag does not exist"})
        }
        console.log(template)
    
    const template_edit = await prisma.codeTemplate.update({
        where:{
            id:templateId,
        },
        data:{
            
            tags:{
                disconnect:{id:tagId}
            }
        }   ,include:{
                tags:true
            }
    })

        res.status(200).json(template_edit) 
    }catch(error:any){
        res.status(500).json({error:"Code template update unsuccessful"})
    } 
    
}


export default verification(handler)