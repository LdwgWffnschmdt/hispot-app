import { OnInit, Component } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

const CurrentUserForProfile = gql`
  query user($id: ID!) {
    location(id: $id) {
      id
      name
    }
  }
`;

interface QueryResponse{
  User
  loading
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  loading: boolean;
  user: any;

  constructor(public apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo.watchQuery<QueryResponse>({
      query: CurrentUserForProfile,
      variables: {
        id: 123
      }
    }).subscribe(({data}) => {
      this.loading = data.loading;
      this.user = data.User;
      console.log(data);
    });
  }

}
