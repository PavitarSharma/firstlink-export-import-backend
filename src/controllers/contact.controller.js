import { contactService } from "../services/contact.service.js";
import { mailService } from "../services/mail.service.js";
import ErrorHandler from "../utils/ErrorHandler.js";

class ContactController {
    /**
     * @body { name, email, pohone, message}
    */
   async createContact(req, res, next){
    const { name, email, phone, message } = req.body
    if(!name) return next(new ErrorHandler("Please enter a name", 400))
    if(!email) return next(new ErrorHandler("Please enter an email", 400))
    if(!message) return next(new ErrorHandler("Please enter a message", 400));

    await contactService.createContact(req.body)
    await mailService.contactUsMail({...req.body}, "contactus-mail")
    res.status(201).json({
        success: true,
        message: "Contact submitted successfully"
    })
   }

   async getAllContacts(req, res, next){
    const contacts = await contactService.getAllContacts()
    res.status(200).json(contacts)
   }

   async getContact(req, res, next){
    const contact = await contactService.getContact(req.params.id)
    res.status(200).json(contact)
   }

   async updateContact(req, res, next){
    const contact = await contactService.updateContact(req.params.id, req.body)
    res.status(200).json(contact)
   }

   async deleteContact(req, res, next){
    const contact = await contactService.deleteContact(req.params.id)
    res.status(200).json(contact)
   }
}

export const contactController = new ContactController();