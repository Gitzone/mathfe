import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { HouseService } from '../../services/house.service';
import { House } from '../../models/house';
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component"
import { AdminHouseTracksListComponent } from './modal/admin-house-tracks-list/admin-house-tracks-list.component';
import { debug } from 'util';
import { HouseTrackService } from '../../services/house-track.service';
import { TrackService } from '../../services/track.service';
import { Track } from '../../models/track';
import { AdminAddTrackListComponent } from './modal/admin-add-track-list/admin-add-track-list.component';

@Component({
  selector: 'ag-admin-house-list',
  templateUrl: './admin-house-list.component.html',
  styleUrls: ['./admin-house-list.component.css']
})
export class AdminHouseListComponent implements OnInit {
  tracks: Track[];
  private _beURL = environment.apiURL + '/';
  public houses: House[];
  public loading: boolean = true;

  // sort block

  public sortedByTitle: boolean = false;
  public sortedByDescription: boolean = false;
  public sortedByStart: boolean = false;
  public sortedByEnd: boolean = false;

  public reversedByTitle: boolean = false;
  public reversedByDescription: boolean = false;
  public reversedByStart: boolean = false;
  public reversedByEnd: boolean = false;

  ShowColumns = {
    Image: true,
    Title: true,
    Description: true,
    Start_Date: true,
    End_Date: true,
    Action: true
  }

  constructor(
    private _router: Router,
    private houseService: HouseService, private trackService: HouseTrackService,
    public dialog: MatDialog
  ) { }


  ngOnInit() {
    this._updateloading(true);
    this.houseService.getHouses()
      .subscribe(items => {
        this.houses = items.sort(this._sortById);
        this._updateloading(false);
      });
  }
  resetUpdateStatus() {
    this.houseService.updateStatus = '';
  }

  get updateStatus(): string {
    return this.houseService.updateStatus;
  }
  private _updateloading(status: boolean): void {
    this.loading = status;
  }
  public imageUrl(url: string): string {
    if (!url) {
      return "/images/no-image.jpg";
    }
    return this._beURL + url;
  }
  // sort block

  public sortBy(str: string): void {
    if (this.houses && this.houses.length) {
      switch (str) {
        case 'title':
          if (this.sortedByTitle) {
            this.houses.reverse();
            this._resetSort();
            this.reversedByTitle = true;
          }
          else {
            this.houses.sort(this._sortByTitle);
            this._resetSort();
            this.sortedByTitle = true;
          }
          break;
        case 'description':
          if (this.sortedByDescription) {
            this.houses.reverse();
            this._resetSort();
            this.reversedByDescription = true;
          }
          else {
            this.houses.sort(this._sortByDescription);
            this._resetSort();
            this.sortedByDescription = true;
          }
          break;
        case 'start':
          if (this.sortedByStart) {
            this.houses.reverse();
            this._resetSort();
            this.reversedByStart = true;
          }
          else {
            this.houses.sort(this._sortByStart);
            this._resetSort();
            this.sortedByStart = true;
          }
          break;
        case 'end':
          if (this.sortedByEnd) {
            this.houses.reverse();
            this._resetSort();
            this.reversedByEnd = true;
          }
          else {
            this.houses.sort(this._sortByEnd);
            this._resetSort();
            this.sortedByEnd = true;
          }
          break;
      }
    }
  }


  private _sortById(a: House, b: House): number {
    if (a.id < b.id) {
      return -1;
    }
    else if (a.id > b.id) {
      return 1;
    }
    else {
      return 0;
    }
  }

  private _sortByTitle(a: House, b: House): number {
    if (a.house.toLowerCase() < b.house.toLowerCase()) {
      return -1;
    }
    else if (a.house.toLowerCase() > b.house.toLowerCase()) {
      return 1;
    }
    else {
      return 0;
    }
  }

  private _sortByDescription(a: House, b: House): number {
    if (a.description.toLowerCase() < b.description.toLowerCase()) {
      return -1;
    }
    else if (a.description.toLowerCase() > b.description.toLowerCase()) {
      return 1;
    }
    else {
      return 0;
    }
  }

  public editHouse(id: number): void {
    this._router.navigate(['/admin/houses/edit', id]);
    setTimeout(() => window.scrollTo(0, 0), 0);
  }
  private _sortByStart(a: House, b: House): number {
    if (a.start_date < b.start_date) {
      return -1;
    }
    else if (a.start_date > b.start_date) {
      return 1;
    }
    else {
      return 0;
    }
  }

  private _sortByEnd(a: House, b: House): number {
    if (a.end_date < b.end_date) {
      return -1;
    }
    else if (a.end_date > b.end_date) {
      return 1;
    }
    else {
      return 0;
    }
  }

  private _resetSort(): void {
    this.sortedByTitle = false;
    this.sortedByDescription = false;
    this.sortedByStart = false;
    this.sortedByEnd = false;
    this.reversedByTitle = false;
    this.reversedByDescription = false;
    this.reversedByStart = false;
    this.reversedByEnd = false;
  }

  // open dialog block

  public openDialog(id: number): void {
    this.dialog.open(ConfirmDialogComponent, { data: { message: "Are you sure?", title: "Delete Class" } }).afterClosed().
      subscribe(ifYes => {
        if (ifYes) {
          //accepted
          this._router.navigate(['/admin/houses/delete', id]);
        } else {
          //rejected
        }
      });
  }

  openViewTrack(houseid): void {
    const dialogRef = this.dialog.open(AdminHouseTracksListComponent, {
      data: { houseid: houseid }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getAddTrack(houseid) {
    const dialogRef = this.dialog.open(AdminAddTrackListComponent, {
      width: '400px',
      data: { houseid: houseid }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.houseService.updateStatus = result;
        window.scrollTo(0, 0)
      }
    });
  }

  deleteAllTracks(houseid) {
    this.dialog.open(ConfirmDialogComponent, { data: { message: "Do you really want to delete all the tracks from this class?", title: "Delete All Tracks" } }).afterClosed().
      subscribe(ifYes => {
        if (ifYes) {
          this.loading = true;
          this.trackService.deleteAllTracks(houseid).subscribe((x: any) => {
            //this.tracks = x.tracks;
            this.houseService.updateStatus = x.message;
            this.loading = false;
            window.scrollTo(0, 0)
            //accepted
          }, (err) => {
            console.error(err);
            this.houseService.updateStatus = 'Server is not responding, please try after some time!'
            window.scrollTo(0, 0)
          })
        } else {
          //rejected
        }
      });
  }
}


