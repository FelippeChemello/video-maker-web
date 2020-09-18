Caso não consiga acessar o S3, observar as subnets/VPC da função lambda, removendo-os tende a funcionar

para rodar o exemplo basta executar

```
aws lambda invoke --function-name video-maker --invocation-type Event --payload file://input-file-example.txt outputfile.txt
```

```
aws lambda invoke --function-name <Nome da função lambda> --invocation-type Event --payload file://input-file-example.txt outputfile.txt
```

editar o input-file-example.txt nos locais em bold conforme a seguir.
Os dois primeiros referem-se ao nome do bucket e o terceiro é o nome do arquivo com o qual deseja-se trabalhar

``` 
{
  "Records":[
    {
      "eventVersion":"2.0",
      "eventSource":"aws:s3",
      "awsRegion":"us-west-2",
      "eventTime":"1970-01-01T00:00:00.000Z",
      "eventName":"ObjectCreated:Put",
      "userIdentity":{
        "principalId":"AIDAJDPLRKLG7UEXAMPLE"
      },
      "requestParameters":{
        "sourceIPAddress":"127.0.0.1"
      },
      "responseElements":{
        "x-amz-request-id":"C3D13FE58DE4C810",
        "x-amz-id-2":"FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
      },
      "s3":{
        "s3SchemaVersion":"1.0",
        "configurationId":"testConfigRule",
        "bucket":{
          "name":"**video-maker-files.codestack.me**",
          "ownerIdentity":{
            "principalId":"A3NL1KOZZKExample"
          },
          "arn":"arn:aws:s3:::**video-maker-files.codestack.me**"
        },
        "object":{
          "key":"**profile.jpg**",
          "size":1024,
          "eTag":"d41d8cd98f00b204e9800998ecf8427e",
          "versionId":"096fKKXTRTtl3on89fVO.nfljtsv6qko"
        }
      }
    }
  ]
}
```