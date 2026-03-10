import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../core/services/site-data.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  readonly data = inject(SiteDataService);
}
