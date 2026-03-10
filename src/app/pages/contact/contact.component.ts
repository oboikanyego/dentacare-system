import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../core/services/site-data.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  readonly data = inject(SiteDataService);
}
