import React from 'react';
import { MixpanelAction } from './mixpanel';

export const dataTrack = (isUserLoggedIn, user, type) => {
    try {
        if(isUserLoggedIn) {           
            MixpanelAction.identify(user?.id);
            MixpanelAction.track(type);
            MixpanelAction.people.set({
            $first_name: user?.fN ,
            $last_name: user?.lN ,
            $email: user?.emailId,
        });
        }
        // redirect to logged in page or something
    } catch (e) {
        MixpanelAction.track('Unsuccessful');
    }
}