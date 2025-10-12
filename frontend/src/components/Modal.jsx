import { createContext, useContext, useState, useEffect } from "react";

export default function Modal ({children}){
    return(
        <div className="w-[100vw] h-[100vh] fixed inset-0 flex items-center justify-center bg-gray-800/75 z-50">
            <div className="w-96 h-[80vh] bg-white opacity-100 p-2 overflow-y-scroll">
                {children}
            </div>
        </div>
    )
}