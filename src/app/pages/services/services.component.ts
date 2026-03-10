import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../core/services/site-data.service';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  readonly data = inject(SiteDataService);
}
