import { Response } from 'express';
export const ok=(res:Response,data:unknown,status=200)=>res.status(status).json({ok:true,data});
export const fail=(res:Response,status:number,message:string,details?:unknown)=>res.status(status).json({ok:false,message,details});
