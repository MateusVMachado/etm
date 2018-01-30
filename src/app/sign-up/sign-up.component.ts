import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['../app.component.css']
})
export class SignUpComponent implements OnInit {

  public form: FormGroup;
  constructor(private fb: FormBuilder) { }
  
  ngOnInit() {

    this.form = this.fb.group({
      "Nome": ["", [Validators.required]],
      "Email": ["", [Validators.required]],
      "Senha": ["", [Validators.required]],
      "ConfirmacaoSenha": ["", [Validators.required]]
    });
  }

}
