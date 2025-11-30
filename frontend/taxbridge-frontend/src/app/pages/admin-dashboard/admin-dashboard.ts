import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective
} from '@coreui/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  user: any = null;

  private authService = inject(AuthService);

  ngOnInit() {
    // Para usuarios admin almacenamos la info en localStorage (taxbridge_user)
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('taxbridge_user') : null;
      this.user = raw ? JSON.parse(raw) : null;
    } catch (err) {
      this.user = null;
    }
  }
}