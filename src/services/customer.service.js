import { v4 as uuidv4 } from "uuid";
import { Customer } from "../models/customer.model.js";
import { logger } from "../config/logger.js";
import { ACTIVATION_SECRET } from "../config/environment.js";
import crypto from "crypto";
import { deleteFileFromS3, generateUploadURL } from "../utils/aws.js";
class CustomerService {
  async findById(id) {
    return await Customer.findById(id);
  }

  async findByEmail(email) {
    return await Customer.findOne({ email });
  }

  async updateLoginDevices(customer, device) {
    try {
      const existingDeviceIndex = customer.loginDevices.findIndex(
        (loginDevice) => loginDevice.device === device
      );

      if (existingDeviceIndex !== -1) {
        customer.loginDevices[existingDeviceIndex].count += 1;
        logger.info(`Device '${device}' count incremented`);
      } else {
        customer.loginDevices.push({ device, count: 1 });
        logger.info(`Device '${device}' added to loginDevices`);
      }

      logger.info("Updated customer:", customer);
      return customer;
    } catch (error) {
      logger.error("Error updating login devices:", error.message);
      return null;
    }
  }

  async deleteSingleDevice(deleteDeviceInput) {
    const { email, device } = deleteDeviceInput;

    try {
      const customer = await Customer.findOne({ email });
      if (!customer) {
        throw new Error("Customer not found");
      }

      const deviceIndex = customer.loginDevices.findIndex(
        (loginDevice) => loginDevice.device === device
      );
      if (deviceIndex !== -1) {
        customer.loginDevices.splice(deviceIndex, 1);
        await customer.save();
        logger.info(`Device '${device}' removed successfully`);
      } else {
        logger.info(`Device '${device}' not found`);
      }
    } catch (error) {
      logger.error("Error deleting device:", error.message);
      throw error;
    }
  }

  async deleteAllDevices(email) {
    try {
      const customer = await Customer.findOne({ email });
      if (!customer) {
        throw new Error("Customer not found");
      }

      customer.loginDevices = [];
      await customer.save();
      logger.info("All devices removed successfully");
    } catch (error) {
      logger.error("Error deleting all devices:", error.message);
      throw error;
    }
  }

  async generateUsername(email) {
    let username = email.split("@")[0];

    const isUsernameNotUnique = await Customer.findOne({ username });

    isUsernameNotUnique ? (username += uuidv4().substring(0, 5)) : "";

    return username;
  }

  hashVerificationToken(data) {
    return crypto
      .createHmac("sha256", ACTIVATION_SECRET)
      .update(data)
      .digest("hex");
  }

  resetPasswordToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async findResetPasswordToken(token) {
    return await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordTime: { $gt: Date.now() },
    })
  }

  async accountVerified(hash, data) {
    const computedHash = this.hashVerificationToken(data);
    return computedHash === hash;
  }

  async register(customer) {
    const username = await this.generateUsername(customer.email);
    const data = {
      ...customer,
      username,
    };

    return await Customer.create(data);
  }

  async login(email, password) {
    return await Customer.findOne({ email, password });
  }

  async updateProfile(id, body) {
    return await Customer.findByIdAndUpdate(id, body, { new: true });
  }

  async updateProfilePicture(id, file) {
    // const customer = await this.findById(id);
    // if (customer.profileImg && customer.profileImg.id) {
    //   await deleteFileFromS3(customer.profileImg.url);
    // }

    const profileImg = await generateUploadURL(file);

    return await Customer.findByIdAndUpdate(id, { profileImg }, { new: true });
  }

  async createAddress(id, addressData) {
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error("User not found");
    }
    // Deactivate existing addresses
    customer.addresses.forEach((address) => {
      address.isActive = false;
    });

    const newAddress = {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country,
      zipcode: addressData.zipcode,
      lat: addressData.lat,
      lng: addressData.lng,
      isActive: true,
    };

    customer.addresses.push(newAddress);
    await customer.save();


    return newAddress;
  }

  async getAddress(id, addressId) {
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error("User not found");
    }

    const addressIndex = customer.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex !== -1) {
      return customer.addresses[addressIndex];
    } else {
      throw new Error("Address not found");
    }
  }

  async getAllAddresses(id) {
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error("User not found");
    }

    return customer.addresses.sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateAddress(id, addressId, body) {
   
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error("User not found");
    }
   

    const addressIndex = customer.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex !== -1) {
      customer.addresses[addressIndex] = {
        ...customer.addresses[addressIndex],
        ...body,
      };

      // Save the updated customer document
      await customer.save();

      return customer.addresses[addressIndex];
    } else {
      throw new Error("Address not found");
    }
  }

  async deleteAddress(id, addressId) {
    const customer = await this.findById(id);

    if (!customer) {
      throw new Error("User not found");
    }

    const addressIndex = customer.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );


    if (addressIndex !== -1) {
      customer.addresses.splice(addressIndex, 1);

      // Save the updated customer document
      await customer.save();

      return customer.addresses;
    } else {
      throw new Error("Address not found");
    }
  }

  async activeAddress(userId, addressId) {
    const customer = await this.findById(userId);

    if (!customer) {
      throw new Error("User not found");
    }

    const address = customer.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Deactivate all other addresses
    customer.addresses.forEach((addr) => {
      addr.isActive = addr._id.equals(addressId); // Set isActive to true only for the target address
    });

    // Save the updated customer
    await customer.save();

    return customer.addresses;
  }

  async updatePassword(userId, password) {
    const customer = await this.findById(userId);

    if (!customer) {
      throw new Error("User not found");
    }

    customer.password = password;

    // Save the updated customer
    await customer.save();

    return customer.password;
  }

  async getWishlists(id) {
    const customer =  await Customer.findById(id).populate("wishlists");
    return customer.wishlists;
  }
}

export const customerService = new CustomerService();
