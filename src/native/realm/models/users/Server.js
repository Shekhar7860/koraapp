import { Model } from '@nozbe/watermelondb';
import { field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Server extends Model {
	static table = Constants.Servers;

	@field('appServer') appServer;

	@field('presenceServer') presenceServer;

	@field('botServer') botServer;
}
