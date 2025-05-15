def serialize_document(document):
    document["_id"] = str(document["_id"])  # Convertir ObjectId a string
    return document
