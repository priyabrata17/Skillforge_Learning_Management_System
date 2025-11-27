const Joi = require("joi");

// +++++++++++++ Validate User Schema ++++++++++++++++
const userSchemaValidator = Joi.object({
  fullName: Joi.string().required().trim().message({
    "any.required": "Fullname is required",
  }),
  email: Joi.string().email().required().trim().message({
    "any.required": "Email is required",
  }),
  password: Joi.string().required().trim().message({
    "any.required": "Password is required",
  }),
  confirmPassword: Joi.valid(Joi.ref("password")).messages({
    "any.only": "Password and Confirm password should be same",
    "string.empty": "Confirm password is required",
  }),
});

const courseSchemaValidation = Joi.object({
  instructor: Joi.string().required().messages({
    "any.required": "Instructor is required",
  }),

  title: Joi.string().min(3).max(100).required().messages({
    "string.min": "Title must be at least 3 characters long",
    "any.required": "Course title is required",
  }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "any.required": "Description is required",
  }),

  skillLevel: Joi.string()
    .valid("Beginner", "Intermediate", "Advanced")
    .required()
    .messages({
      "any.only":
        "Skill level must be one of Beginner, Intermediate, or Advanced",
      "any.required": "Skill level is required",
    }),

  certificate: Joi.string().valid("Yes", "No").required().messages({
    "any.only": "Certificate must be 'Yes' or 'No'",
    "any.required": "Certificate field is required",
  }),
});

module.exports = { userSchemaValidator, courseSchemaValidation };
