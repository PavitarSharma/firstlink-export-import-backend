import { Schema, model } from "mongoose"

const contactSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    message: String
}, {
    timestamps: true
})

export const Contact = model('Contact', contactSchema)