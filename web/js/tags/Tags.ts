import twitter_txt from 'twitter-text';
import {isPresent} from '../Preconditions';
import {Optional} from '../util/ts/Optional';
import {Tag} from './Tag';

export class Tags {

    public static assertValid(label: string) {

        if (!this.validate(label).isPresent()) {
            throw new Error("Invalid tag: " + label);
        }

    }

    public static validate(label: string): Optional<string> {

        if (!isPresent(label)) {
            return Optional.empty();
        }

        if (!label.startsWith('#')) {
            label = '#' + label;
        }

        if (twitter_txt.isValidHashtag(label)) {
            return Optional.of(label);
        }

        return Optional.empty();

    }

    public static validateTag(tag: Tag): Optional<Tag> {

        if (this.validate(tag.label).isPresent()) {
            return Optional.of(tag);
        }

        return Optional.empty();

    }

    /**
     * Return true if all the tags are valid.  If no tags are given we return
     * true as the input set had no valid tags.
     */
    public static validateTags(...tags: Tag[]): boolean {

        return tags.map(tag => this.validateTag(tag).isPresent())
                   .reduce((acc, curr) => ! acc ? false : curr, true);

    }

    /**
     * Return tags that are invalid.
     * @param tags
     */
    public static invalidTags(...tags: Tag[]): Tag[] {
        return tags.filter(tag => ! this.validateTag(tag).isPresent());
    }

    public static toMap(tags: Tag[]) {

        const result: { [id: string]: Tag } = {};

        for (const tag of tags) {
            result[tag.id] = tag;
        }

        return result;

    }

    public static toIDs(tags: Tag[]) {
        return tags.map(current => current.id);
    }

}
