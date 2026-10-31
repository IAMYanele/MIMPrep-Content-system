"""Ad-hoc Frame.io GraphQL query against a share. usage: gq.py <share_id> '<query>'"""
import json, sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
import fio_dl
try:
    print(json.dumps(fio_dl.gql(sys.argv[1], sys.argv[2]), indent=1)[:4000])
except RuntimeError as e:
    for er in e.args[0]:
        print("ERR", er.get("message"))
