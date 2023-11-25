import { Schema, model } from 'mongoose';
import {
  // StudentMethods,
  StudentModel,
  TGuardian,
  TLocalGuardian,
  TStudent,
  TUserName,
} from './student.interface';
import validator from 'validator';
import bcrypt from 'bcrypt';
import config from '../../config';

// Sub-Schemas
const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [20, 'Name can not be more than 20 characters'],

    // custom validator
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      message: '{VALUE} is not in capitalize format',
    },
  },
  middleName: { type: String, trim: true },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last name is required'],
    // validate using library
    validate: {
      validator: (value: string) => {
        validator.isAlpha(value);
      },
      message: '{VALUE} is not valid',
    },
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    trim: true,
    required: [true, "Father's name is required"],
  },
  fatherOccupation: {
    type: String,
    trim: true,
    required: [true, "Father's occupation is required"],
  },
  fatherContactNo: {
    type: String,
    required: [true, "Father's contact number is required"],
  },
  motherName: {
    type: String,
    trim: true,
    required: [true, "Mother's name is required"],
  },
  motherOccupation: {
    type: String,
    trim: true,
    required: [true, "Mother's occupation is required"],
  },
  motherContactNo: {
    type: String,
    required: [true, "Mother's contact number is required"],
  },
});

const localGuardianSchema = new Schema<TLocalGuardian>({
  name: {
    type: String,
    trim: true,
    required: [true, "Local guardian's name is required"],
  },
  occupation: {
    type: String,
    trim: true,
    required: [true, "Local guardian's occupation is required"],
  },
  contactNo: {
    type: String,
    required: [true, "Local guardian's contact number is required"],
  },
});

// Schema
// for static
const studentSchema = new Schema<TStudent, StudentModel>({
  // for instance
  // const studentSchema = new Schema<TStudent, StudentModel, StudentMethods>({
  id: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
  },
  name: {
    type: userNameSchema,
    trim: true,
    required: [true, 'Student name is required'],
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: '{VALUE} is not valid',
    },
    required: [true, 'Gender is required'],
  },
  dateOfBirth: { type: String, required: [true, 'Date of birth is required'] },
  email: {
    type: String,
    trim: true,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [20, 'Password cannot be more than 20 characters'],
  },
  contactNo: { type: String, required: [true, 'Contact number is required'] },
  emergencyContactNo: {
    type: String,
    required: [true, 'Emergency contact number is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'O+', 'O-', 'AB+', 'AB-', 'B+', 'B-'],
  },
  presentAddress: {
    type: String,
    trim: true,
    required: [true, 'Present address is required'],
  },
  permanentAddress: {
    type: String,
    trim: true,
    required: [true, 'Permanent address is required'],
  },
  guardian: {
    type: guardianSchema,
    required: [true, 'Guardian information is required'],
  },
  localGuardian: {
    type: localGuardianSchema,
    required: [true, 'Local guardian information is required'],
  },
  profileImg: { type: String },
  isActive: { type: String, enum: ['active', 'blocked'], default: 'active' },
});

// pre save middleware / hook : will work on create() & save()
studentSchema.pre('save', async function (next) {
  // console.log(this, 'pre hook: we will save the data');

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

// post save middleware / hook
studentSchema.post('save', function () {
  console.log(this, 'post hook: we will save the data');
});

// for creating custom static method
studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

/* 
// for custom instance method
studentSchema.methods.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};
 */

// Model
// const XModel    = model<InterfaceName>('X=this will be the collection name in DB', xSchema)
export const Student = model<TStudent, StudentModel>('Student', studentSchema);
