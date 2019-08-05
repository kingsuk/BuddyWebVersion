import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CameraComponent } from './camera/camera.component';
import { MasterUiComponent } from './master-ui/master-ui.component';

const routes: Routes = [
  { path: 'face-login', component: CameraComponent },
  { path: 'master-ui', component: MasterUiComponent },
  // { path: '',   redirectTo: '/master', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
