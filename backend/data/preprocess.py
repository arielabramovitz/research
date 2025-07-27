from azure.cosmos import CosmosClient, PartitionKey, DatabaseProxy, ContainerProxy
from azure.cosmos.exceptions import CosmosResourceNotFoundError, CosmosResourceExistsError
from conllu import parse, SentenceGenerator
from dotenv import load_dotenv
from os import environ

load_dotenv("../.env")

uri = environ["URI"]
pkey = environ["PKEY"]
db_name = "ResearchDB"
sentence_sets_container_name = "SentenceSets"
participant_cont_name = "ParticipantAnswers"


def generate_sentence_sets():
    with (open('./he_htb-ud-dev.conllu', 'r', encoding='utf-8') as dev,
          open('./he_htb-ud-train.conllu', 'r', encoding='utf-8') as train,
          open('./he_htb-ud-test.conllu', 'r', encoding='utf-8') as test):
        sentences = list(parse(dev.read())) + list(parse(train.read())) + parse(test.read())
        sets = []
        no_verbs = []
        aux_sets = []
        for i in range(len(sentences) - 2):
            first = sentences[i]
            second = sentences[i + 1]
            third = sentences[i + 2]
            verbs = list(map(lambda x: x['form'], second.filter(upos='VERB')))
            aux = list(map(lambda x: x['form'], second.filter(upos='AUX', lemma='היה')))
            aux_past = list(map(lambda x: x['form'], second.filter(feats__Tense='Past', lemma='היה', upos='AUX')))
            # if len(verbs) == 0:
            #     if len(set(aux) - set(aux_past)) > 0:
            #
            #         aux_sets.append({
            #             "id": str(i),
            #             "sentences": [first.metadata['text'], second.metadata['text'], third.metadata['text']],
            #             "verbs": list([verb for verb in aux if verb in set(aux) - set(aux_past)])
            #         })
            #     else:
            #         print(f"Set {i}: {second.metadata['text']}")
            #         # no_verbs.append({
            #         #     "id": str(i),
            #         #     "sentences": [first.metadata['text'], second.metadata['text'], third.metadata['text']],
            #         #     "verbs": list(no_verbs)
            #         # })
            # else:
            #     sets.append({
            #         "id": str(i),
            #         "sentences": [first.metadata['text'], second.metadata['text'], third.metadata['text']],
            #         "verbs": verbs
            #     })
            sets.append({
                "id": str(i),
                "sentences": [first.metadata['text'], second.metadata['text'], third.metadata['text']],
                "verbs": verbs
            })
    return sets
    # return sets, no_verbs, aux_sets


def update_sets_with_aux(db: DatabaseProxy, aux_sets):
    container = db.get_container_client(sentence_sets_container_name)
    if container:
        for curr_set in aux_sets:
            container.replace_item(item=curr_set['id'], body=curr_set)


def upload_sentence_sets(db, sentence_sets):
    sentence_sets_container = db.create_container_if_not_exists(id=sentence_sets_container_name,
                                                                partition_key=PartitionKey(path="/id"))
    if sentence_sets_container:
        for sentence_set in sentence_sets:
            try:
                sentence_sets_container.upsert_item(body=sentence_set)
            except CosmosResourceExistsError:
                print(f"Question set {sentence_set} already exists")


if __name__ == "__main__":
    client = CosmosClient(uri, {'masterKey': pkey})
    sets = generate_sentence_sets()
    print(f"Total sets: {len(sets)}")

    # for s in sets:
    #     print(s)
    # print(f"Total sets: {len(sets)}")
    # for i in range(len(no_verbs)):
    #     print(no_verbs[i], end="\n\n")
    # print(f"Total sets with no verbs: {len(no_verbs)}")
    # for s in aux_sets:
    #     print(s)
    # print(f"Total sets with auxiliary verbs: {len(aux_sets)}")

    db = client.create_database_if_not_exists(id=db_name)
    if db:
        upload_sentence_sets(db, sets)
    # update_sets_with_aux(db, aux_sets)
