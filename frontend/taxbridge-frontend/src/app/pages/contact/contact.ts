import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// === v4 ===
import {
  ContainerComponent,
  GridModule,
  CardModule,
  ButtonModule,
  FormModule,
  InputGroupComponent,
  AlertModule
  // ModalModule ELIMINADO
} from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ContainerComponent,
    GridModule,
    CardModule,
    ButtonModule,
    FormModule,
    InputGroupComponent,
    AlertModule,
    IconModule
    // ModalModule ELIMINADO
  ],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss']
})
export class ContactComponent implements OnInit {

  contactForm!: FormGroup;
  contactItems: any[] = [];
  submitMessage: string = '';
  submitStatus: 'success' | 'danger' = 'success';
  // showSuccessModal ELIMINADO

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef // <-- Inyectar ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.contactItems = [
      {
        label: 'Email',
        value: 'contacto@taxbridge.ec',
        icon: 'cil-envelope-closed',
        colorClass: 'bg-primary',
        link: 'mailto:contacto@taxbridge.ec'
      },
      {
        label: 'Teléfono',
        value: '+593 99 999 9999',
        icon: 'cil-phone',
        colorClass: 'bg-info',
        link: 'tel:+593999999999'
      },
      {
        label: 'Dirección',
        value: 'Quito, Pichincha, Ecuador',
        icon: 'cil-location-pin',
        colorClass: 'bg-warning'
      },
      {
        label: 'Horario',
        value: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
        icon: 'cil-clock',
        colorClass: 'bg-success'
      }
    ];
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const serviceID = 'service_io39qac';
    const templateID = 'template_7hteuce';
    const publicKey = 'OHIW1xC3aLfq2oVJF';

    const emailJsPayload = {
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      template_params: this.contactForm.value
    };

    // Le decimos al HttpClient que esperamos 'text'
    this.http.post('https://api.emailjs.com/api/v1.0/email/send', emailJsPayload, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.submitMessage = '¡Mensaje enviado con éxito! Te responderemos pronto.';
          this.submitStatus = 'success';
          this.contactForm.reset();
          // showSuccessModal = true ELIMINADO
          
          this.cdr.markForCheck(); // <-- Se mantiene para mostrar la alerta y limpiar el form
        },
        error: (error) => {
          this.submitMessage = 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
          this.submitStatus = 'danger';
          
          this.cdr.markForCheck(); // <-- Se mantiene para mostrar la alerta de error
        }
      });
  }
}