import {HttpService} from "@nestjs/axios";

const FLINK_URL = 'http://nest:8100/flink'

export class FlinkClient {
    constructor(private readonly http: HttpService) {}
    send(func: string, data: any) {
        this.http.post(FLINK_URL, data, {
            headers: {
                'Content-Type': `application/vnd.${func}`
            }
        })

    }

}
