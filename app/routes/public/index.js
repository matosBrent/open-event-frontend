import Route from '@ember/routing/route';
import moment from 'moment';

export default Route.extend({
  async model() {
    const eventDetails = this.modelFor('public');
    return {
      event   : eventDetails,
      tickets : await eventDetails.query('tickets', {
        reload: true,

        filter: [
          {
            and: [
              {
                name : 'sales-starts-at',
                op   : 'le',
                val  : moment().toISOString()
              },
              {
                name : 'sales-ends-at',
                op   : 'ge',
                val  : moment().toISOString()
              }
            ]
          }
        ]
      }),
      speakers: await eventDetails.query('speakers', {
        filter: [
          {
            name : 'sessions',
            op   : 'any',
            val  : {
              name : 'state',
              op   : 'eq',
              val  : 'accepted'
            }
          }
        ]
      }),

      sponsors: await eventDetails.get('sponsors'),

      order: this.store.createRecord('order', {
        event     : eventDetails,
        user      : this.get('authManager.currentUser'),
        tickets   : [],
        attendees : []
      }),

      attendees: []
    };
  },
  resetController(controller) {
    this._super(...arguments);
    const model = controller.get('model.order');
    if (!model.id) {
      model.unloadRecord();
    }
  }
});
