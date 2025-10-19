import { Component } from '@angular/core';
import { 
  RowComponent, 
  ColComponent, 
  CardComponent, 
  CardBodyComponent, 
  CardHeaderComponent,
  BadgeComponent,
  ButtonDirective
} from '@coreui/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    BadgeComponent,
    ButtonDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {

}
