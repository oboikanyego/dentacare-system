import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MasterDataItem } from '../../core/models/master-data.model';
import { MasterDataService } from '../../core/services/master-data.service';
import { SiteDataService } from '../../core/services/site-data.service';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  readonly data = inject(SiteDataService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly liveServices = signal<MasterDataItem[]>([]);
  readonly liveServicesLoaded = signal(false);

  ngOnInit(): void {
    this.masterDataService
      .search('services', '', 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.liveServices.set(res.items.filter((i) => i.isActive !== false));
          this.liveServicesLoaded.set(true);
        },
        error: () => {
          this.liveServicesLoaded.set(true);
        }
      });
  }

  getPrice(item: MasterDataItem): string {
    return (item.metadata?.['price'] as string) || '';
  }
}
