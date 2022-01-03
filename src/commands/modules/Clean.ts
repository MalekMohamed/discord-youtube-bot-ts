import { SlashCommandBuilder } from '@discordjs/builders';
import { QueueManager, UserInteraction } from 'bot-classes';
import { ResponseEmojis } from 'bot-config';
import { BaseCommand } from '../BaseCommand';
import { command } from '../decorators/command';

export default class Clean implements BaseCommand {
	register() {
		return new SlashCommandBuilder().setName('clean').setDescription('Remove all duplicates from the queue.');
	}

	@command({
		ephemeral: false,
		enforceVoiceConnection: true
	})
	async runner(handler: UserInteraction) {
		const queue = new QueueManager(handler.guild.id, 'youtube');
		const currentItems = await queue.getAll();
		const oldLen = currentItems.length;
		const dedupedItems = Array.from(new Set(currentItems));
		const newLen = dedupedItems.length;
		await queue.purge(); // Delete the queue, Redis does not have functionality to dedupe. We'll let JS do that.
		const awaitingReAdded = dedupedItems.map(item => queue.add(item));
		await Promise.all(awaitingReAdded);
		handler.editWithEmoji(`The queue has been cleaned!\nRemoved: \`${oldLen - newLen}\`.`, ResponseEmojis.Success);
	}
}
