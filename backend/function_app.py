import azure.functions as func
import json
from azure.cosmos import CosmosClient, exceptions
import random
import os
import logging

num_of_rows = 6141
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)
temporary_excluded = {41, 44, 46, 51, 71, 72, 77, 91, 97, 102, 107, 147, 150, 153, 164, 167, 175, 176, 178, 186, 187, 192, 200, 204, 215, 228, 229, 231, 244, 249, 252, 258, 263, 275, 277, 281, 286, 288, 295, 334, 351, 384, 401, 421, 422, 425, 454, 459, 466, 471, 482, 493, 494, 526, 592, 609, 643, 674, 705, 706, 711, 737, 741, 750, 760, 776, 777, 819, 823, 824, 839, 840, 860, 873, 875, 877, 896, 924, 947, 965, 969, 987, 994, 995, 999, 1022, 1040, 1043, 1069, 1084, 1085, 1093, 1098, 1131, 1137, 1153, 1155, 1208, 1213, 1238, 1283, 1309, 1324, 1342, 1343, 1398, 1406, 1407, 1420, 1424, 1457, 1463, 1477, 1480, 1483, 1485, 1498, 1520, 1533, 1537, 1541, 1574, 1578, 1595, 1606, 1612, 1618, 1619, 1628, 1634, 1635, 1636, 1653, 1669, 1677, 1682, 1683, 1688, 1696, 1736, 1744, 1752, 1760, 1770, 1954, 2033, 2039, 2040, 2103, 2152, 2176, 2214, 2224, 2226, 2249, 2285, 2289, 2316, 2322, 2363, 2383, 2398, 2399, 2406, 2422, 2424, 2425, 2426, 2440, 2464, 2477, 2483, 2490, 2499, 2505, 2509, 2511, 2512, 2521, 2522, 2523, 2524, 2532, 2536, 2549, 2550, 2551, 2552, 2553, 2571, 2577, 2578, 2585, 2591, 2614, 2636, 2642, 2662, 2664, 2665, 2677, 2718, 2727, 2728, 2736, 2742, 2743, 2744, 2745, 2746, 2747, 2748, 2749, 2769, 2797, 2801, 2836, 2859, 2874, 2875, 2926, 2944, 2966, 2974, 3024, 3032, 3042, 3050, 3096, 3124, 3132, 3186, 3190, 3191, 3192, 3193, 3198, 3212, 3216, 3254, 3255, 3256, 3294, 3295, 3296, 3297, 3318, 3339, 3383, 3392, 3394, 3406, 3413, 3420, 3426, 3466, 3484, 3486, 3521, 3568, 3575, 3576, 3585, 3586, 3603, 3605, 3607, 3608, 3609, 3613, 3622, 3635, 3641, 3648, 3661, 3663, 3668, 3675, 3677, 3679, 3683, 3684, 3702, 3724, 3818, 3828, 3849, 3906, 3925, 3927, 3928, 3934, 3935, 3943, 3948, 3970, 3971, 4001, 4008, 4029, 4041, 4053, 4059, 4068, 4069, 4070, 4072, 4073, 4091, 4135, 4151, 4171, 4174, 4212, 4224, 4225, 4226, 4228, 4229, 4230, 4234, 4238, 4242, 4248, 4255, 4258, 4281, 4285, 4299, 4302, 4322, 4364, 4365, 4366, 4412, 4413, 4414, 4425, 4436, 4441, 4448, 4476, 4501, 4520, 4546, 4567, 4571, 4592, 4611, 4616, 4619, 4633, 4634, 4645, 4682, 4687, 4694, 4699, 4701, 4710, 4714, 4732, 4736, 4759, 4762, 4792, 4836, 4925, 4930, 4950, 4953, 4986, 5004, 5027, 5042, 5066, 5117, 5131, 5133, 5165, 5230, 5280, 5375, 5403, 5421, 5456, 5458, 5462, 5464, 5469, 5482, 5489, 5514, 5556, 5569, 5573, 5578, 5581, 5582, 5583, 5585, 5586, 5589, 5590, 5591, 5592, 5593, 5596, 5597, 5598, 5599, 5607, 5615, 5621, 5624, 5627, 5628, 5633, 5638, 5652, 5674, 5675, 5678, 5680, 5685, 5686, 5696, 5732, 5733, 5737, 5739, 5749, 5751, 5780, 5791, 5792, 5850, 5851, 5855, 5920, 5925, 5940, 5957, 5965, 5966, 5973, 6002, 6008, 6016, 6027, 6033, 6035, 6039, 6041, 6042, 6059, 6067, 6105, 6109, 6114, 6122, 6127, 6139}
available_indices = list(set(range(num_of_rows)) - temporary_excluded)

@app.route(route="sentences", methods=[func.HttpMethod.GET])
def getSentences(req: func.HttpRequest) -> func.HttpResponse:
    PKEY = os.getenv("PKEY")
    URI = os.getenv("URI")
    DB_NAME = "ResearchDB"
    CONT_NAME = "SentenceSets"
    n = req.params.get('n')
    
    if n:
        client = CosmosClient(URI, credential=PKEY)
        db = client.get_database_client(DB_NAME)
        container = db.get_container_client(CONT_NAME)
        n = int(n)
        inds = random.sample(available_indices, n)
        inds_str = ", ".join([f"\"{i}\"" for i in inds])
        query = f"SELECT * FROM c WHERE c.id IN ({inds_str})"
        items = list(container.query_items(query=query, enable_cross_partition_query=True))
        body = json.dumps(items)
        return func.HttpResponse(body, status_code=200, mimetype="application/json")
    else:
        return func.HttpResponse(
            "Request formatted incorrectly",
            status_code=200
        )


def updateExistingAnswers(prevAnswers, newAnswers):
    merged_answers = {}

    logging.info(prevAnswers['answers'])
    for answer in prevAnswers['answers']:
        merged_answers[answer['sentenceSetId']] = answer

    for answer in newAnswers['answers']:

        if answer['sentenceSetId'] in merged_answers:
            updated_questions = answer['questions'] + merged_answers[answer['sentenceSetId']]['questions']
            updated = {
                'sentenceSetId': answer['sentenceSetId'],
                'sentences': answer['sentences'],
                'questions': updated_questions,
            }
            merged_answers[answer['sentenceSetId']] = updated
        else:
            merged_answers[answer['sentenceSetId']] = answer

    return {'id': prevAnswers['id'], 'answers': list(merged_answers.values())}


@app.route(route="answers", auth_level=func.AuthLevel.ANONYMOUS, methods=[func.HttpMethod.POST])
def uploadAnswers(req: func.HttpRequest) -> func.HttpResponse:
    PKEY = os.getenv("PKEY")
    URI = os.getenv("URI")
    DB_NAME = "ResearchDB"
    CONT_NAME = "ParticipantAnswers"
    req_body = req.get_json()
    pid = req_body.get('id')
    session_id = req_body.get('sessionId')
    answers = req_body.get("answers")
    imc = req_body.get("IMCAnswers")
    attention = req_body.get("AttentionAnswers")
    if pid and answers and session_id:
        client = CosmosClient(URI, credential=PKEY)
        db = client.get_database_client(DB_NAME)
        container = db.get_container_client(CONT_NAME)
        queryPrev = f"SELECT * FROM c WHERE c.prolific_id='{pid}' AND c.sessionId='{session_id}'"
        prevAnswers = list(container.query_items(queryPrev, enable_cross_partition_query=True))
        merged = {
            "prolific_id": pid,
            "session_id": session_id,
            "answers": answers
        }
        if prevAnswers:
            merged = prevAnswers[0] 
            merged['answers'] += answers
            merged['IMCAnswers'] = imc
            merged['AttentionAnswers'] = attention
            
        try:
            container.upsert_item(merged)
            return func.HttpResponse("Success", status_code=200)
        except exceptions.CosmosHttpResponseError as e:
            return func.HttpResponse(f"Error: {e.message}", status_code=500)

    return func.HttpResponse("Invalid input", status_code=400)
