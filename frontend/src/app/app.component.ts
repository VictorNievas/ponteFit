import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { LoginComponent } from './login/login.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  data: any;

  constructor(private apiService: ApiService) { }


  ngOnInit(): void {
    
  }
}
