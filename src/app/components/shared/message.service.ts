import { Injectable } from '@angular/core';
import swal from 'sweetalert';

@Injectable()
export class MessageService {
    info(message: string, title?: string): any { 
        swal({
            title: title,
            text: message,
            icon: "question",
        })
    }

    success(title: string, message?: string): Promise<any> { 
        return swal({
            title: title,
            text: message,
            icon: "success",
        })
    }

    warn(message: string, title?: string): any { 
        swal({
            title: title,
            text: message,
            icon: "warn",
        })
    }

    error(message: string, title?: string): any {
        swal({
            title: title,
            text: message,
            icon: "error",
        })    
    }

    confirm(message: string, titleOrCallBack?: string | ((result: boolean) => void), callback?: (result: boolean) => void): any { }

}