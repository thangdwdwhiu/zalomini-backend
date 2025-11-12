import dotenv from 'dotenv'
import * as groupServices from '../services/groupServices.js'


dotenv.config()



const getGroupContacts = async (req, res) =>{
        const {groupID} = req.body
        try{
                const result = await groupServices.getGroupContacts(groupID)
        }
}