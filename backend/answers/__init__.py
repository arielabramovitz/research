import azure.functions as func
import os
import json
from azure.cosmos import CosmosClient, exceptions
import logging

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


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON", status_code=400)

    pid = req_body.get("id")
    session_id = req_body.get("sessionId")
    answers = req_body.get("answers")
    imc = req_body.get("IMCAnswers")
    attention = req_body.get("AttentionAnswers")

    if not (pid and session_id and answers):
        return func.HttpResponse("Invalid input", status_code=400)

    PKEY = os.getenv("PKEY")
    URI = os.getenv("URI")
    DB_NAME = "ResearchDatabase"
    CONT_NAME = "ParticipantAnswers"

    client = CosmosClient(URI, credential=PKEY)
    container = client.get_database_client(DB_NAME).get_container_client(CONT_NAME)
    query = f"SELECT * FROM c WHERE c.prolific_id='{pid}' AND c.sessionId='{session_id}'"
    prevAnswers = list(container.query_items(query, enable_cross_partition_query=True))

    merged = req_body
    if prevAnswers:
        merged = updateExistingAnswers(prevAnswers[0], req_body)
        merged['IMCAnswers'] = imc
        merged['AttentionAnswers'] = attention

    try:
        container.upsert_item(merged)
        return func.HttpResponse("Success", status_code=200)
    except exceptions.CosmosHttpResponseError as e:
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
