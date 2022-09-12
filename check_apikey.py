from systemFordK.models import accessKey
import datetime
import requests
import os

class Key:

    payload={'grant_type': 'refresh_token',
    'refresh_token': os.environ["FORDAPI"],
    'client_id': '30990062-9618-40e1-a27b-7c6bcb23658a',
    'client_secret': 'T_Wk41dx2U9v22R5sQD4Z_E1u-l2B-jXHE'}
    headers={}
    def __accessKeyReq(self):
        try:
            request = requests.post("https://dah2vb2cprod.b2clogin.com/914d88b1-3523-4bf6-9be4-1b96b4f6f919/oauth2/v2.0/token?p=B2C_1A_signup_signin_common", headers=self.headers, data=self.payload).json()
            success = True
            bearer = request["access_token"]
            
            return {"bearer": bearer, "success":success}
        except:
            success = False
            error = "Something wrong with the refresh token"
            return {"success":success, "error":error}
    
    def __setBearer(self, token):
        bearer = token
        try:
            bearerDBobj = accessKey(access=bearer)
            bearerDBobj.save()
            success = True
            return {"success":success}
        except:
            success = False
            message = "Couldnt Save new key"
            return {"success":success, "message":message}

    def __checkAccessKey(self):
        try: 
            obj = accessKey.objects.latest('pk')
            exist = True
            return {"obj":obj, "exist":exist}
        except accessKey.DoesNotExist:
            obj = False
            exist = False
            return {"exist":exist, "obj":obj}




    def shouldUpdate(self):
        objCheck = self.__checkAccessKey()
        if objCheck["exist"]:
            bearer = objCheck["obj"].access
            timeOrigin = objCheck["obj"].timeCreated
            
            now=datetime.datetime.now(datetime.timezone.utc)
        
            
            timeDiff = now - timeOrigin
            sec= timeDiff.total_seconds()
            minutes = int(sec / 60 )
            if minutes >= 20:
                keyObj = self.__accessKeyReq()
                if keyObj["success"]:
                    bearObjSet = self.__setBearer(keyObj["bearer"])
                    if bearObjSet["success"]:
                        bear = keyObj["bearer"]
                        success = bearObjSet["success"]
                        return {"bear":bear, "success":success}
                    else:
                        message = bearObjSet["message"]
                        success = bearObjSet["success"]
                        return {"message":message, "success":success}
                else:
                    success = keyObj["success"]
                    message = keyObj["error"]
                    return {"message":message, "success":success}
            else:
                bear = bearer
                success = objCheck["exist"]
                return {"bear":bear, "success":success}
        else:
            keyObj = self.__accessKeyReq()
            if keyObj["success"]:
                bearObjSet = self.__setBearer(keyObj["bearer"])
                if bearObjSet["success"]:
                    bear = keyObj["bearer"]
                    success = bearObjSet["success"]
                    return {"bear":bear, "success":success}
                else: 
                    message = bearObjSet["message"]
                    success = bearObjSet["success"]
                    return {"message":message, "success":success}
            else: 
                message = keyObj["error"]
                success = keyObj["success"]
                return {"message":message, "success":success}



# //////////////////////////////////////////////////////////////////////////////////////////////////////////////

from keyquery import Key
import requests


class Request():

    appId = "afdc085b-377a-4351-b23e-5e1d35fb3700"

    def requestFleetCommandPost(self, vehId, urlEnding):
        obj = Key()
        objBear = obj.shouldUpdate()
        print(objBear["success"])
        if objBear["success"]:
            headers={"Authorization" : "Bearer " + objBear["bear"],
            "Application-Id": self.appId}
            try:
                request = requests.post('https://api.mps.ford.com/api/fordconnect/vehicles/v1/' + str(vehId) + urlEnding, headers=headers).json()
                print(request)
                success = True
                return {"request": request, "success":success}
            except:
                success = False
                return {"success":success}
    
    def requestFleetListGet(self):
        obj = Key()
        objBear = obj.shouldUpdate()
        print(objBear["bear"])
        if objBear["success"]:
            headers={"Authorization" : "Bearer " + objBear["bear"],"api-version": "2020-06-01",
            "Application-Id": self.appId}
            try:
                request = requests.get('https://api.mps.ford.com/api/fordconnect/vehicles/v1', headers=headers).json()
                success = True
                print(request)
                return {"request": request, "success":success}
            except:
                success = False
                return {"success":success}
    
    def requestAllVehicleLocationGet(self, vehicalId):
        obj = Key()
        objBear = obj.shouldUpdate()
        if objBear["success"]:
            headers={"Authorization" : "Bearer " + objBear["bear"],
            "api-version": "2020-06-01",
            "Application-Id": self.appId}
            try:
                request = requests.get('https://api.mps.ford.com/api/fordconnect/vehicles/v1/' + vehicalId +"/location", headers=headers).json()
                print(request)
                success = True
                return {"request":request, "success":success}
            except:
                success = False
                return {"success":success}
    
    def requestDetailGetOne(self, vehicalId):
        obj = Key()
        objBear = obj.shouldUpdate()
        if objBear["success"]:
            headers={"Authorization" : "Bearer " + objBear["bear"],
            "api-version": "2020-06-01",
            "Application-Id": self.appId}
            try:
                request = requests.get('https://api.mps.ford.com/api/fordconnect/vehicles/v1/' + vehicalId, headers=headers).json()
                success = True
                return {"request":request, "success":success}
            except:
                success = False
                return {"success":success}