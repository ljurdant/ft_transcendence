import { Controller, UseGuards} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Get} from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
	constructor(private readonly  statsService :  StatsService ) {}

	@Get('lead')
	findLeaders()
	{
		return this.statsService.findLeaders();
	}
}