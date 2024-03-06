import { Contact } from "../models/contact.model.js";

class ContactService {
  async createContact(body) {
    return await Contact.create(body);
  }

  async getAllContacts() {
    return await Contact.find().sort({ createdAt: -1 });
  }

  async getContact(id) {
    return await Contact.findById(id);
  }

  async updateContact(id, body) {
    return await Contact.findByIdAndUpdate(id, body, { new: true });
  }

  async deleteContact(id) {
    return await Contact.findByIdAndDelete(id);
  }
}

export const contactService = new ContactService();
