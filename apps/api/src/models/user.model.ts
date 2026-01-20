import mongoose, {
    Schema,
    type InferSchemaType,
    type Model
}from "mongoose";
import argon2 from "argon2";


const UserSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
            minLength: 2,
            maxLength: 20
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
        password:{
            type: String,
            required: true,
            select: false
        },
        refreshTokenHash: {
            type: String,
            select: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);


export type IUser = InferSchemaType<typeof UserSchema> & {
  refreshTokenHash?: string;
};

UserSchema.methods.verifyPassword = async function(
    plainPassword: string,
): Promise<boolean>{
    return argon2.verify(this.password, plainPassword);
};


UserSchema.pre("save", async function(){
    if(!this.isModified("password")) return;

    this.password = await argon2.hash(this.password,{
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
    });
});


export const User: Model<IUser> = mongoose.models.User || mongoose.model("User", UserSchema);